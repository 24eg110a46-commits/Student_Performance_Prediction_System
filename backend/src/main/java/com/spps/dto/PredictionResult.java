package com.spps.dto;

/** Result of a prediction. confidence is null when the rule-based fallback produced it. */
public record PredictionResult(String category, double score, Double confidence, String source) {}
