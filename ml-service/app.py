"""
Prediction API used by the Spring Boot backend.

POST /predict   body: {attendance, studyHours, previousMarks, assignmentScore, internalMarks, activities}
                reply: {category: LOW|AVERAGE|HIGH, score: 0-100, confidence: 0-1}
GET  /metrics   model type and accuracy figures
GET  /health    simple liveness check

Run:  python app.py      (listens on http://localhost:5001)
"""
import os

import joblib
import pandas as pd
from flask import Flask, jsonify, request

from train_model import FEATURES, MODEL_PATH, train

app = Flask(__name__)

# JSON field (sent by the backend) -> training column
FIELD_MAP = {
    "attendance": "attendance",
    "studyHours": "study_hours",
    "previousMarks": "previous_marks",
    "assignmentScore": "assignment_score",
    "internalMarks": "internal_marks",
    "activities": "activities",
}
LIMITS = {
    "attendance": (0, 100),
    "studyHours": (0, 24),
    "previousMarks": (0, 100),
    "assignmentScore": (0, 100),
    "internalMarks": (0, 100),
    "activities": (0, 10),
}


def load_bundle() -> dict:
    """Load the saved model; train a new one if it is missing or was saved by an incompatible version."""
    if os.path.exists(MODEL_PATH):
        try:
            return joblib.load(MODEL_PATH)
        except Exception as exc:  # noqa: BLE001
            print(f"Could not load saved model ({exc}). Training a new one...")
    else:
        print("No saved model found. Training one now...")
    return train()


bundle = load_bundle()


@app.get("/health")
def health():
    return jsonify(status="ok")


@app.get("/metrics")
def metrics():
    return jsonify(bundle["metrics"])


@app.post("/predict")
def predict():
    data = request.get_json(silent=True) or {}
    row = {}
    for field, column in FIELD_MAP.items():
        try:
            value = float(data[field])
        except (KeyError, TypeError, ValueError):
            return jsonify(message=f"'{field}' is required and must be a number"), 400
        low, high = LIMITS[field]
        if not low <= value <= high:
            return jsonify(message=f"'{field}' must be between {low} and {high}"), 400
        row[column] = value

    frame = pd.DataFrame([row], columns=FEATURES)
    classifier = bundle["classifier"]
    probabilities = classifier.predict_proba(frame)[0]
    best = probabilities.argmax()
    category = str(classifier.classes_[best])
    score = float(bundle["regressor"].predict(frame)[0])
    score = round(min(max(score, 0.0), 100.0), 1)

    return jsonify(category=category, score=score, confidence=round(float(probabilities[best]), 3))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)))
