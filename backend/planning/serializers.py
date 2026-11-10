from rest_framework import serializers
from .models import ProductionOrder, ProductionAssignment


#region Production Assignment Serializer
class ProductionAssignmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductionAssignment
        fields = [
            "id",
            "line",
            "units",
            "duration_seconds",
            "started_at",
            "finished_at",
        ]
#endregion


#region Production Order Serializer
class ProductionOrderSerializer(serializers.ModelSerializer):

    assignments = ProductionAssignmentSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = ProductionOrder

        fields = [
            "id",
            "product_name",
            "quantity",
            "status",
            "duration_seconds",
            "is_priority",
            "assigned_line",
            "started_at",
            "created_at",
            "assignments",
        ]

        read_only_fields = [
            "id",
            "status",
            "is_priority",
            "assigned_line",
            "started_at",
            "created_at",
        ]

    #region Validation
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than zero."
            )
        return value

    def validate_duration_seconds(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Production duration must be greater than zero."
            )
        return value
    #endregion
#endregion
