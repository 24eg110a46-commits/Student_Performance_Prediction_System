package com.spps.service;

import com.spps.dto.MlRequest;
import com.spps.dto.MlResponse;
import com.spps.dto.PredictionResult;
import com.spps.model.Student;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

/**
 * Predicts a student's performance level (LOW / AVERAGE / HIGH) and expected score.
 *
 * The main prediction comes from the machine learning model in the ml-service folder (Random Forest,
 * Scikit-learn). If that service cannot be reached, a transparent weighted formula is used instead so the
 * application keeps working. Each saved student records which of the two produced the result.
 */
@Service
public class PredictionService {

    public static final String HIGH = "HIGH";
    public static final String AVERAGE = "AVERAGE";
    public static final String LOW = "LOW";

    public static final String SOURCE_ML = "ML model";
    public static final String SOURCE_FALLBACK = "Rule-based fallback";

    private static final Set<String> CATEGORIES = Set.of(HIGH, AVERAGE, LOW);

    private final MlClient mlClient;

    public PredictionService(MlClient mlClient) {
        this.mlClient = mlClient;
    }

    public PredictionResult predict(double attendance, double studyHours, double previousMarks,
                                    double assignmentScore, double internalMarks, int activities) {
        Optional<MlResponse> ml = mlClient.predict(new MlRequest(
                attendance, studyHours, previousMarks, assignmentScore, internalMarks, activities));

        if (ml.isPresent() && ml.get().category() != null
                && CATEGORIES.contains(ml.get().category().toUpperCase())) {
            MlResponse r = ml.get();
            return new PredictionResult(r.category().toUpperCase(), round(r.score()), r.confidence(), SOURCE_ML);
        }

        double score = formulaScore(attendance, studyHours, previousMarks, assignmentScore, internalMarks, activities);
        return new PredictionResult(categorize(score), score, null, SOURCE_FALLBACK);
    }

    public void applyPrediction(Student s) {
        PredictionResult r = predict(s.getAttendance(), s.getStudyHours(), s.getPreviousMarks(),
                s.getAssignmentScore(), s.getInternalMarks(), s.getActivities());
        s.setPredictedScore(r.score());
        s.setPerformanceCategory(r.category());
        s.setConfidence(r.confidence());
        s.setPredictionSource(r.source());
    }

    /** Weighted formula used only when the ML service is unreachable. */
    private double formulaScore(double attendance, double studyHours, double previousMarks,
                                double assignmentScore, double internalMarks, int activities) {
        double studyScore = Math.min(studyHours / 6.0, 1.0) * 100;
        double activityScore = Math.min(activities / 10.0, 1.0) * 100;
        double score = previousMarks * 0.30
                + internalMarks * 0.25
                + assignmentScore * 0.15
                + attendance * 0.15
                + studyScore * 0.10
                + activityScore * 0.05;
        return round(score);
    }

    private String categorize(double score) {
        if (score >= 75) return HIGH;
        if (score >= 50) return AVERAGE;
        return LOW;
    }

    private double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
