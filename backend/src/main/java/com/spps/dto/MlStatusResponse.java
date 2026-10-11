package com.spps.dto;

public record MlStatusResponse(boolean available, String modelType, Double accuracy, Integer trainingSamples) {}
