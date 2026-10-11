package com.spps.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** JSON reply from the Python ML service. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record MlResponse(String category, double score, double confidence) {}
