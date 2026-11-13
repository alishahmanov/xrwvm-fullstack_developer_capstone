from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView

from djangoapp.views import FrontendView

frontend = FrontendView.as_view()
urlpatterns = [
    path("admin/", admin.site.urls),
    path("djangoapp/", include("djangoapp.urls")),
    path("", frontend),
    path("about", TemplateView.as_view(template_name="About.html")),
    path("contact", TemplateView.as_view(template_name="Contact.html")),
    path("login", frontend),
    path("register", frontend),
    path("dealers", frontend),
    path("dealer/<int:dealer_id>", frontend),
    path("postreview/<int:dealer_id>", frontend),
]
