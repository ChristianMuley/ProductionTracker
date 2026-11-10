from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from .models import ProductionOrder, ProductionAssignment


NORMAL_LINES = ("A", "B", "C")
PRIORITY_LINE = "D"


def update_production():
    now = timezone.now()

    with transaction.atomic():

        #region Complete Finished Assignments
        running_orders = ProductionOrder.objects.filter(
            status="in_progress"
        ).prefetch_related("assignments")

        for order in running_orders:
            assignments = list(order.assignments.all())

            if assignments:
                for assignment in assignments:

                    if assignment.finished_at is not None:
                        continue

                    finish_time = assignment.started_at + timedelta(
                        seconds=assignment.duration_seconds
                    )

                    if now >= finish_time:
                        assignment.finished_at = finish_time
                        assignment.save(update_fields=["finished_at"])

                # Complete the order only when EVERY portion is finished
                if all(
                        assignment.finished_at is not None
                        for assignment in assignments
                ):
                    order.status = "completed"
                    order.save(update_fields=["status"])

            # Support orders started by our previous scheduler
            elif order.assigned_line and order.started_at:
                finish_time = order.started_at + timedelta(
                    seconds=order.duration_seconds
                )

                if now >= finish_time:
                    order.status = "completed"
                    order.save(update_fields=["status"])
        #endregion

        #region Find Available Lines
        occupied_lines = set(
            ProductionAssignment.objects.filter(
                order__status="in_progress",
                finished_at__isnull=True
            ).values_list("line", flat=True)
        )

        # Include any orders still running under the old system
        legacy_lines = ProductionOrder.objects.filter(
            status="in_progress",
            assignments__isnull=True,
            assigned_line__isnull=False
        ).values_list("assigned_line", flat=True)

        occupied_lines.update(legacy_lines)

        available_normal_lines = [
            line for line in NORMAL_LINES
            if line not in occupied_lines
        ]
        #endregion

        #region Distribute Normal Orders
        while available_normal_lines:

            next_order = ProductionOrder.objects.filter(
                status="queued",
                is_priority=False
            ).order_by("created_at", "id").first()

            if next_order is None:
                break

            # Never assign more lines than there are units
            line_count = min(
                len(available_normal_lines),
                next_order.quantity
            )

            units_per_line, remainder = divmod(
                next_order.quantity,
                line_count
            )

            selected_lines = available_normal_lines[:line_count]

            for index, line in enumerate(selected_lines):

                # Distribute leftover units across the first lines
                units = units_per_line

                if index < remainder:
                    units += 1

                # Duration is proportional to assigned units
                duration = (
                        next_order.duration_seconds
                        * units
                        / next_order.quantity
                )

                ProductionAssignment.objects.create(
                    order=next_order,
                    line=line,
                    units=units,
                    duration_seconds=duration,
                    started_at=now
                )

            next_order.status = "in_progress"
            next_order.save(update_fields=["status"])

            # Remove occupied lines from the available list
            available_normal_lines = available_normal_lines[line_count:]
        #endregion

        #region Process Priority Orders
        if PRIORITY_LINE not in occupied_lines:

            next_priority = ProductionOrder.objects.filter(
                status="queued",
                is_priority=True
            ).order_by("created_at", "id").first()

            if next_priority is not None:

                ProductionAssignment.objects.create(
                    order=next_priority,
                    line=PRIORITY_LINE,
                    units=next_priority.quantity,
                    duration_seconds=next_priority.duration_seconds,
                    started_at=now
                )

                next_priority.status = "in_progress"
                next_priority.save(update_fields=["status"])
        #endregion
