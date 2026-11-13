from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class CarMake(models.Model):
    name = models.CharField(max_length=80, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class CarModel(models.Model):
    class BodyType(models.TextChoices):
        SEDAN = "Sedan"
        SUV = "SUV"
        WAGON = "Wagon"
        COUPE = "Coupe"
        HATCHBACK = "Hatchback"
        CONVERTIBLE = "Convertible"
        TRUCK = "Truck"
        MINIVAN = "Minivan"
        OTHER = "Other"

    make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name="models")
    name = models.CharField(max_length=80)
    type = models.CharField(max_length=16, choices=BodyType.choices)
    year = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(2015), MaxValueValidator(2023)]
    )

    class Meta:
        ordering = ["make__name", "name", "year"]
        constraints = [
            models.UniqueConstraint(fields=["make", "name", "year"], name="unique_car_model_year")
        ]

    def __str__(self):
        return f"{self.make} {self.name} ({self.year})"
