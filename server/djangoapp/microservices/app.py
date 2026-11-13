from pathlib import Path

from flask import Flask, jsonify, request
from nltk import data
from nltk.sentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
lexicon = Path(__file__).resolve().parent / "sentiment" / "vader_lexicon.zip"
data.path.insert(0, str(lexicon.parent))
sia = SentimentIntensityAnalyzer("nltk:vader_lexicon.zip/vader_lexicon/vader_lexicon.txt")


@app.get("/")
def home():
    return "Welcome to the Sentiment Analyzer. Use /analyze?text=your+review."


@app.get("/analyze")
@app.get("/analyze/<path:input_txt>")
def analyze_sentiment(input_txt=None):
    text = request.args.get("text", "") if input_txt is None else input_txt
    if not text.strip():
        return jsonify(error="Review text is required"), 400
    score = sia.polarity_scores(text)["compound"]
    sentiment = "neutral"
    if score >= 0.05:
        sentiment = "positive"
    elif score <= -0.05:
        sentiment = "negative"
    return jsonify(sentiment=sentiment)
