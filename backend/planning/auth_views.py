import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import (
    csrf_protect,
    ensure_csrf_cookie
)
from django.views.decorators.http import require_GET, require_POST


#region Check Session
@ensure_csrf_cookie
@require_GET
def session_status(request):

    return JsonResponse({
        "authenticated": request.user.is_authenticated,
        "username": (
            request.user.get_username()
            if request.user.is_authenticated
            else None
        )
    })
#endregion


#region Login
@csrf_protect
@require_POST
def login_user(request):

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"detail": "Invalid JSON."},
            status=400
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {"detail": "Invalid login data."},
            status=400
        )

    username = data.get("username")
    password = data.get("password")

    if not isinstance(username, str) or not isinstance(password, str):
        return JsonResponse(
            {"detail": "Username and password are required."},
            status=400
        )

    # Verify credentials using Django's authentication system
    user = authenticate(
        request,
        username=username,
        password=password
    )

    if user is None:
        return JsonResponse(
            {"detail": "Invalid username or password."},
            status=401
        )

    # Create the authenticated session
    login(request, user)

    return JsonResponse({
        "authenticated": True,
        "username": user.get_username()
    })
#endregion


#region Logout
@csrf_protect
@require_POST
def logout_user(request):

    # End the current session
    logout(request)

    return JsonResponse({
        "authenticated": False,
        "username": None
    })
#endregion
