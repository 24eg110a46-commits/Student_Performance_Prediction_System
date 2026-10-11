"""
Trains the machine learning models used by the Student Performance Prediction System.

- RandomForestClassifier  -> performance level: LOW / AVERAGE / HIGH
- RandomForestRegressor   -> expected score out of 100

Usage:  python train_model.py
"""
import json
import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, classification_report, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from generate_dataset import CSV_PATH, generate

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(HERE, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "student_models.joblib")
METRICS_PATH = os.path.join(MODEL_DIR, "metrics.json")

FEATURES = [
    "attendance",
    "study_hours",
    "previous_marks",
    "assignment_score",
    "internal_marks",
    "activities",
]


def load_data() -> pd.DataFrame:
    if not os.path.exists(CSV_PATH):
        os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
        generate().to_csv(CSV_PATH, index=False)
        print(f"No dataset found, generated a sample one at {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    df = df.dropna(subset=FEATURES + ["final_score", "performance"])  # data preprocessing: drop incomplete rows
    df["performance"] = df["performance"].str.upper().str.strip()
    return df


def train() -> dict:
    df = load_data()
    X = df[FEATURES]
    y_class = df["performance"]
    y_score = df["final_score"]

    X_train, X_test, yc_train, yc_test, ys_train, ys_test = train_test_split(
        X, y_class, y_score, test_size=0.2, random_state=42, stratify=y_class
    )

    classifier = RandomForestClassifier(
        n_estimators=200, min_samples_leaf=2, class_weight="balanced", random_state=42, n_jobs=-1
    )
    classifier.fit(X_train, yc_train)

    regressor = RandomForestRegressor(n_estimators=200, min_samples_leaf=2, random_state=42, n_jobs=-1)
    regressor.fit(X_train, ys_train)

    pred_class = classifier.predict(X_test)
    pred_score = regressor.predict(X_test)

    accuracy = accuracy_score(yc_test, pred_class)
    mae = mean_absolute_error(ys_test, pred_score)
    r2 = r2_score(ys_test, pred_score)

    print(f"Trained on {len(X_train)} rows, tested on {len(X_test)} rows")
    print(f"Classification accuracy: {accuracy:.3f}")
    print(classification_report(yc_test, pred_class))
    print(f"Score prediction  MAE: {mae:.2f}  R2: {r2:.3f}")

    metrics = {
        "modelType": "Random Forest (classifier + regressor)",
        "accuracy": round(float(accuracy), 4),
        "scoreMae": round(float(mae), 2),
        "scoreR2": round(float(r2), 4),
        "trainingSamples": int(len(X_train)),
        "testSamples": int(len(X_test)),
        "featureImportance": {
            f: round(float(v), 4) for f, v in zip(FEATURES, classifier.feature_importances_)
        },
    }

    bundle = {"classifier": classifier, "regressor": regressor, "features": FEATURES, "metrics": metrics}
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(bundle, MODEL_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved model to {MODEL_PATH}")
    return bundle


if __name__ == "__main__":
    train()
