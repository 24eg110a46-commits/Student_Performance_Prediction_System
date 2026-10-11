"""
Generates a synthetic student dataset (data/student_data.csv) for training.

The data is simulated: a hidden "ability" value drives attendance, study hours and marks so that they
are realistically correlated, and the final score is a noisy weighted combination of the factors.
Replace data/student_data.csv with real institutional records (same columns) and run train_model.py
again to train on real data.

Columns: attendance, study_hours, previous_marks, assignment_score, internal_marks, activities,
         final_score, performance (LOW / AVERAGE / HIGH)
"""
import os

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(HERE, "data", "student_data.csv")


def label_for(score: float) -> str:
    if score >= 75:
        return "HIGH"
    if score >= 50:
        return "AVERAGE"
    return "LOW"


def generate(n: int = 3000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    ability = rng.normal(0, 1, n)

    attendance = np.clip(72 + 12 * ability + rng.normal(0, 8, n), 30, 100)
    study_hours = np.clip(3.2 + 1.4 * ability + rng.normal(0, 1.0, n), 0, 10)
    previous = np.clip(62 + 14 * ability + rng.normal(0, 7, n), 15, 100)
    assignment = np.clip(65 + 12 * ability + rng.normal(0, 9, n), 10, 100)
    internal = np.clip(63 + 13 * ability + rng.normal(0, 8, n), 10, 100)
    activities = np.clip(np.round(3 + 1.5 * ability + rng.normal(0, 1.5, n)), 0, 10)

    score = (
        0.30 * previous
        + 0.25 * internal
        + 0.15 * assignment
        + 0.15 * attendance
        + 0.10 * np.minimum(study_hours / 6.0, 1.0) * 100
        + 0.05 * (activities / 10.0) * 100
        + rng.normal(0, 3, n)
    )
    score = np.clip(score, 0, 100)

    df = pd.DataFrame(
        {
            "attendance": attendance.round(1),
            "study_hours": study_hours.round(1),
            "previous_marks": previous.round(1),
            "assignment_score": assignment.round(1),
            "internal_marks": internal.round(1),
            "activities": activities.astype(int),
            "final_score": score.round(1),
        }
    )
    df["performance"] = df["final_score"].apply(label_for)
    return df


if __name__ == "__main__":
    os.makedirs(os.path.dirname(CSV_PATH), exist_ok=True)
    data = generate()
    data.to_csv(CSV_PATH, index=False)
    print(f"Wrote {len(data)} rows to {CSV_PATH}")
    print(data["performance"].value_counts())
