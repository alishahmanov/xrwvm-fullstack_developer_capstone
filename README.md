# Best Cars Dealerships

A Django and React dealership directory backed by an Express API and MongoDB. A Flask service classifies review sentiment with VADER.

## Run locally

Run `docker compose up --build` and open http://localhost:8080. The containers migrate Django, seed the car catalog and import the starter dealerships and reviews. To create a local Django admin account, run `docker compose exec web python manage.py createsuperuser` and open http://localhost:8080/admin/.

The app supports registration, sign-in, state filtering, individual dealership pages and review posting. Review authors are drawn from the authenticated Django session.

## Configuration

Set `MONGO_URL` on the Express service and `backend_url` and `sentiment_analyzer_url` on Django for non-Compose deployments. Set `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS` and `DJANGO_CSRF_TRUSTED_ORIGINS` for HTTPS deployment. Mount persistent storage at `/data` for Django and `/data/db` for MongoDB.
