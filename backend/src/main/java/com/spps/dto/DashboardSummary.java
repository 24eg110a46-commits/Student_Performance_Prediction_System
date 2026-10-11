package com.spps.dto;

import com.spps.model.Student;

import java.util.List;
import java.util.Map;

public record DashboardSummary(
        long totalStudents,
        double averageScore,
        double averageAttendance,
        Map<String, Long> categoryCounts,
        List<Bucket> scoreDistribution,
        List<DepartmentStat> departmentStats,
        List<ScorePoint> scorePoints,
        List<Student> topPerformers,
        List<Student> needsSupport
) {
    public record Bucket(String range, long count) {}

    public record DepartmentStat(String department, long students, double averageScore) {}

    public record ScorePoint(String name, double attendance, double studyHours, double score, String category) {}
}
