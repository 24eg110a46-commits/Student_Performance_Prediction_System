package com.spps.service;

import com.spps.dto.DashboardSummary;
import com.spps.dto.DashboardSummary.Bucket;
import com.spps.dto.DashboardSummary.DepartmentStat;
import com.spps.dto.DashboardSummary.ScorePoint;
import com.spps.model.Student;
import com.spps.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final StudentRepository repository;

    public DashboardService(StudentRepository repository) {
        this.repository = repository;
    }

    public DashboardSummary summary() {
        List<Student> students = repository.findAll();

        double avgScore = students.stream().mapToDouble(Student::getPredictedScore).average().orElse(0);
        double avgAttendance = students.stream().mapToDouble(Student::getAttendance).average().orElse(0);

        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put(PredictionService.HIGH, 0L);
        counts.put(PredictionService.AVERAGE, 0L);
        counts.put(PredictionService.LOW, 0L);
        for (Student s : students) {
            counts.merge(s.getPerformanceCategory(), 1L, Long::sum);
        }

        long b1 = students.stream().filter(s -> s.getPredictedScore() < 40).count();
        long b2 = students.stream().filter(s -> s.getPredictedScore() >= 40 && s.getPredictedScore() < 60).count();
        long b3 = students.stream().filter(s -> s.getPredictedScore() >= 60 && s.getPredictedScore() < 80).count();
        long b4 = students.stream().filter(s -> s.getPredictedScore() >= 80).count();
        List<Bucket> distribution = List.of(
                new Bucket("Below 40", b1),
                new Bucket("40-59", b2),
                new Bucket("60-79", b3),
                new Bucket("80 and above", b4));

        Map<String, List<Student>> byDept = students.stream()
                .collect(Collectors.groupingBy(Student::getDepartment, TreeMap::new, Collectors.toList()));
        List<DepartmentStat> deptStats = byDept.entrySet().stream()
                .map(e -> new DepartmentStat(
                        e.getKey(),
                        e.getValue().size(),
                        round(e.getValue().stream().mapToDouble(Student::getPredictedScore).average().orElse(0))))
                .toList();

        List<ScorePoint> points = students.stream()
                .map(s -> new ScorePoint(s.getName(), s.getAttendance(), s.getStudyHours(),
                        s.getPredictedScore(), s.getPerformanceCategory()))
                .toList();

        List<Student> top = students.stream()
                .sorted(Comparator.comparingDouble(Student::getPredictedScore).reversed())
                .limit(5)
                .toList();

        List<Student> needsSupport = students.stream()
                .filter(s -> PredictionService.LOW.equals(s.getPerformanceCategory()))
                .sorted(Comparator.comparingDouble(Student::getPredictedScore))
                .limit(5)
                .toList();

        return new DashboardSummary(
                students.size(),
                round(avgScore),
                round(avgAttendance),
                counts,
                distribution,
                deptStats,
                points,
                top,
                needsSupport);
    }

    private double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
