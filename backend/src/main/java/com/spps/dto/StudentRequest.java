package com.spps.dto;

import jakarta.validation.constraints.*;

public record StudentRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Roll number is required") String rollNumber,
        @NotBlank(message = "Department is required") String department,
        @NotNull(message = "Attendance is required")
        @DecimalMin(value = "0", message = "Attendance must be between 0 and 100")
        @DecimalMax(value = "100", message = "Attendance must be between 0 and 100") Double attendance,
        @NotNull(message = "Study hours are required")
        @DecimalMin(value = "0", message = "Study hours must be between 0 and 24")
        @DecimalMax(value = "24", message = "Study hours must be between 0 and 24") Double studyHours,
        @NotNull(message = "Previous marks are required")
        @DecimalMin(value = "0", message = "Previous marks must be between 0 and 100")
        @DecimalMax(value = "100", message = "Previous marks must be between 0 and 100") Double previousMarks,
        @NotNull(message = "Assignment score is required")
        @DecimalMin(value = "0", message = "Assignment score must be between 0 and 100")
        @DecimalMax(value = "100", message = "Assignment score must be between 0 and 100") Double assignmentScore,
        @NotNull(message = "Internal marks are required")
        @DecimalMin(value = "0", message = "Internal marks must be between 0 and 100")
        @DecimalMax(value = "100", message = "Internal marks must be between 0 and 100") Double internalMarks,
        @NotNull(message = "Activities count is required")
        @Min(value = 0, message = "Activities must be between 0 and 10")
        @Max(value = 10, message = "Activities must be between 0 and 10") Integer activities
) {}
