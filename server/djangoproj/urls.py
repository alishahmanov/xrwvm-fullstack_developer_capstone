from django.contrib import admin
from django.urls import include, path

from djangoapp.views import FrontendView

frontend = FrontendView.as_view()
urlpatterns = [
    path("admin/", admin.site.urls),
    path("djangoapp/", include("djangoapp.urls")),
    path("", frontend),
    path("about", frontend),
    path("contact", frontend),
    path("login", frontend),
    path("register", frontend),
    path("dealers", frontend),
    path("dealer/<int:dealer_id>", frontend),
    path("postreview/<int:dealer_id>", frontend),
]
