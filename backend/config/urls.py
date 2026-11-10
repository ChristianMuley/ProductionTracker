from django.conf import settings
from django.contrib import admin
from django.http import FileResponse
from django.urls import path, include


FRONTEND_DIST = settings.BASE_DIR.parent / "frontend" / "dist"


def frontend_page(request):
    return FileResponse(
        (FRONTEND_DIST / "index.html").open("rb"),
        content_type="text/html"
    )


def frontend_icon(request, filename):
    return FileResponse(
        (FRONTEND_DIST / filename).open("rb"),
        content_type="image/svg+xml"
    )


urlpatterns = [
    # Django
    path("admin/", admin.site.urls),
    path("api/", include("planning.urls")),

    # React public assets
    path("favicon.svg", frontend_icon, {"filename": "favicon.svg"}),
    path("icons.svg", frontend_icon, {"filename": "icons.svg"}),

    # React homepage
    path("", frontend_page, name="frontend"),
]
