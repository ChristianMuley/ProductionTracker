from django.urls import path
from . import views, auth_views

urlpatterns = [

    #region Production Orders
    path(
        "orders/",
        views.get_orders,
        name="get_orders"
    ),

    path(
        "orders/<int:order_id>/",
        views.update_order,
        name="update_order"
    ),

    path(
        "orders/<int:order_id>/dispatch/",
        views.dispatch_order,
        name="dispatch_order"
    ),
    #endregion

    #region Authentication
    path(
        "auth/session/",
        auth_views.session_status,
        name="session_status"
    ),

    path(
        "auth/login/",
        auth_views.login_user,
        name="login_user"
    ),

    path(
        "auth/logout/",
        auth_views.logout_user,
        name="logout_user"
    ),
    #endregion
]
