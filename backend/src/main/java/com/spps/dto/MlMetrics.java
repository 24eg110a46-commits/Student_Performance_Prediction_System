package com.spps.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Model details reported by the Python ML service. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record MlMetrics(String modelType, double accuracy, int trainingSamples) {}
