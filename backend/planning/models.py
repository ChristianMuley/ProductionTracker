from django.db import models


class ProductionOrder(models.Model):

    #region Choices
    STATUS_CHOICES = [
        ("planned", "Planned"),
        ("queued", "Queued"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    LINE_CHOICES = [
        ("A", "Assembly Line A"),
        ("B", "Assembly Line B"),
        ("C", "Assembly Line C"),
        ("D", "Priority Line D"),
    ]
    #endregion

    #region Order Details
    product_name = models.CharField(max_length=120)
    quantity = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="planned"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    #endregion

    #region Production
    duration_seconds = models.PositiveIntegerField(default=60)

    is_priority = models.BooleanField(default=False)

    assigned_line = models.CharField(
        max_length=1,
        choices=LINE_CHOICES,
        null=True,
        blank=True
    )

    started_at = models.DateTimeField(null=True, blank=True)
    #endregion

    def __str__(self):
        return self.product_name



#region Production Assignments
class ProductionAssignment(models.Model):

    # The order this portion belongs to
    order = models.ForeignKey(
        ProductionOrder,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    # The production line processing this portion
    line = models.CharField(
        max_length=1,
        choices=ProductionOrder.LINE_CHOICES
    )

    # Number of units assigned to this line
    units = models.PositiveIntegerField()

    # How long this portion takes to manufacture
    duration_seconds = models.FloatField()

    # When this portion started and finished
    started_at = models.DateTimeField()

    finished_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["order", "line"],
                name="unique_order_line"
            )
        ]

    def __str__(self):
        return f"{self.order.product_name} - Line {self.line}"
#endregion
