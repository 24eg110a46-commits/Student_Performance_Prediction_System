package com.spps.dto;

/** JSON body sent to the Python ML service. */
public record MlRequest(
        double attendance,
        double studyHours,
        double previousMarks,
        double assignmentScore,
        double internalMarks,
        int activities
) {}
