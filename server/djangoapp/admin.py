from django.contrib import admin

from .models import CarMake, CarModel


@admin.register(CarMake)
class CarMakeAdmin(admin.ModelAdmin):
    search_fields = ["name"]


@admin.register(CarModel)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ["make", "name", "type", "year"]
    list_filter = ["type", "year"]
    search_fields = ["make__name", "name"]
