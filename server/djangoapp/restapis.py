import os

import requests

backend_url = os.getenv("backend_url", "http://127.0.0.1:3030").rstrip("/")
sentiment_analyzer_url = os.getenv("sentiment_analyzer_url", "http://127.0.0.1:5050").rstrip("/")


def get_request(endpoint):
    response = requests.get(f"{backend_url}/{endpoint}", timeout=5)
    response.raise_for_status()
    return response.json()


def analyze_review_sentiments(text):
    response = requests.get(f"{sentiment_analyzer_url}/analyze", params={"text": text}, timeout=3)
    response.raise_for_status()
    return response.json()["sentiment"]


def post_review(review):
    response = requests.post(f"{backend_url}/insert_review", json=review, timeout=5)
    response.raise_for_status()
    return response.json()
