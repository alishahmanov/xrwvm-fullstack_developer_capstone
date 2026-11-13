import json
from pathlib import Path

from .models import CarMake, CarModel


def initiate():
    seed_path = Path(__file__).resolve().parents[1] / "database" / "data" / "car_records.json"
    cars = json.loads(seed_path.read_text(encoding="utf-8"))["cars"]
    for car in cars:
        if 2015 <= car["year"] <= 2023:
            make, _ = CarMake.objects.get_or_create(name=car["make"])
            body_type = car["bodyType"]
            CarModel.objects.get_or_create(
                make=make,
                name=car["model"],
                year=car["year"],
                defaults={"type": body_type if body_type in CarModel.BodyType.values else "Other"},
            )
