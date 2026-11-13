import json
from datetime import date
from urllib.parse import quote

import requests
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST
from django.views.generic import TemplateView

from .models import CarModel
from .restapis import analyze_review_sentiments, get_request, post_review


class FrontendView(TemplateView):
    template_name = "index.html"

    @method_decorator(ensure_csrf_cookie)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)


def result(status=200, **values):
    return JsonResponse({"status": status, **values}, status=status)


def json_body(request):
    try:
        data = json.loads(request.body)
    except (UnicodeError, ValueError):
        return {}
    return data if isinstance(data, dict) else {}


@require_GET
def current_user(request):
    return result(userName=request.user.get_username() if request.user.is_authenticated else None)


@require_POST
def login_user(request):
    data = json_body(request)
    user = authenticate(request, username=data.get("userName"), password=data.get("password"))
    if user is None:
        return result(401, error="Invalid username or password.")
    login(request, user)
    return JsonResponse({"userName": user.get_username(), "status": "Authenticated"})


@require_POST
def logout_user(request):
    logout(request)
    return result()


@require_POST
def registration(request):
    data = json_body(request)
    form = UserCreationForm(
        {"username": data.get("userName"), "password1": data.get("password"),
         "password2": data.get("confirmation")}
    )
    if not form.is_valid():
        return result(400, error=" ".join(message for messages in form.errors.values() for message in messages))
    user = form.save(commit=False)
    user.first_name = str(data.get("firstName", "")).strip()[:150]
    user.last_name = str(data.get("lastName", "")).strip()[:150]
    user.email = str(data.get("email", "")).strip()[:254]
    user.save()
    login(request, user)
    return result(userName=user.get_username())


@require_GET
def get_dealerships(request, state="All"):
    endpoint = "fetchDealers" if state == "All" else f"fetchDealers/{quote(state, safe='')}"
    try:
        return result(dealers=get_request(endpoint))
    except requests.RequestException:
        return result(502, error="Dealership service is unavailable.")


@require_GET
def get_dealer_details(request, dealer_id):
    try:
        dealers = get_request(f"fetchDealer/{dealer_id}")
    except requests.RequestException:
        return result(502, error="Dealership service is unavailable.")
    return result(dealer=dealers) if dealers else result(404, error="Dealership not found.")


@require_GET
def get_dealer_reviews(request, dealer_id):
    try:
        reviews = get_request(f"fetchReviews/dealer/{dealer_id}")
    except requests.RequestException:
        return result(502, error="Review service is unavailable.")
    for review in reviews:
        try:
            review["sentiment"] = analyze_review_sentiments(review["review"])
        except requests.RequestException:
            review["sentiment"] = "unavailable"
            break
    return result(reviews=reviews)


@require_GET
def get_cars(request):
    return result(CarModels=[
        {"id": car.pk, "CarMake": car.make.name, "CarModel": car.name, "Year": car.year}
        for car in CarModel.objects.select_related("make")
    ])


@require_POST
def add_review(request):
    if not request.user.is_authenticated:
        return result(403, error="Sign in to post a review.")
    data = json_body(request)
    try:
        car = CarModel.objects.select_related("make").get(pk=int(data["carId"]))
        purchase_date = date.fromisoformat(data["purchase_date"])
        review_text = data["review"].strip()
        dealer_id = int(data["dealership"])
    except (AttributeError, KeyError, TypeError, ValueError, CarModel.DoesNotExist):
        return result(400, error="Provide a valid dealership, car and purchase date.")
    if not review_text or len(review_text) > 2000 or purchase_date > date.today():
        return result(400, error="Enter a review of up to 2,000 characters and a valid purchase date.")
    try:
        review = post_review({
            "name": request.user.get_full_name() or request.user.get_username(),
            "dealership": dealer_id, "review": review_text, "purchase": True,
            "purchase_date": purchase_date.isoformat(), "car_make": car.make.name,
            "car_model": car.name, "car_year": car.year,
        })
    except requests.HTTPError as error:
        if error.response.status_code == 404:
            return result(404, error="Dealership not found.")
        return result(502, error="Review could not be saved.")
    except requests.RequestException:
        return result(502, error="Review service is unavailable.")
    return result(review=review)
