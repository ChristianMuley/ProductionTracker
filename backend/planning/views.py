from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import ProductionOrder
from .serializers import ProductionOrderSerializer
from .services import update_production


#region Retrieve and Create Orders
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def get_orders(request):

    # Retrieve all production orders
    if request.method == "GET":

        # Update production before returning the orders
        update_production()

        orders = ProductionOrder.objects.all()
        serializer = ProductionOrderSerializer(orders, many=True)

        return Response(serializer.data)

    # Check whether the user may create orders
    if not request.user.has_perm("planning.add_productionorder"):
        return Response(
            {"detail": "You don't have permission to create orders."},
            status=status.HTTP_403_FORBIDDEN
        )

    serializer = ProductionOrderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED
    )
#endregion


#region Update and Delete Orders
@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def update_order(request, order_id):

    #region Permissions
    if request.method == "PATCH":
        if not request.user.has_perm("planning.change_productionorder"):
            return Response(
                {"detail": "You don't have permission to edit orders."},
                status=status.HTTP_403_FORBIDDEN
            )

    if request.method == "DELETE":
        if not request.user.has_perm("planning.delete_productionorder"):
            return Response(
                {"detail": "You don't have permission to delete orders."},
                status=status.HTTP_403_FORBIDDEN
            )
    #endregion

    # Retrieve the requested order
    order = get_object_or_404(ProductionOrder, id=order_id)

    #region Delete
    if request.method == "DELETE":
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    #endregion

    #region Update
    serializer = ProductionOrderSerializer(
        order,
        data=request.data,
        partial=True
    )

    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(serializer.data)
    #endregion
#endregion


#region Dispatch Orders
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def dispatch_order(request, order_id):

    # Check whether the user may dispatch orders
    if not request.user.has_perm("planning.change_productionorder"):
        return Response(
            {"detail": "You don't have permission to dispatch orders."},
            status=status.HTTP_403_FORBIDDEN
        )

    # Determine whether the order is normal or priority
    priority = request.data.get("priority")

    if not isinstance(priority, bool):
        return Response(
            {"detail": "Priority must be true or false."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Retrieve the requested order
    order = get_object_or_404(ProductionOrder, id=order_id)

    # Only planned orders can be dispatched
    if order.status != "planned":
        return Response(
            {"detail": "Only planned orders can be dispatched."},
            status=status.HTTP_409_CONFLICT
        )

    # Move the order into the appropriate queue
    order.status = "queued"
    order.is_priority = priority

    order.save(update_fields=["status", "is_priority"])

    # Assign the order if an appropriate line is available
    update_production()

    # Reload the order to get its latest status
    order.refresh_from_db()

    serializer = ProductionOrderSerializer(order)

    return Response(serializer.data)
#endregion
