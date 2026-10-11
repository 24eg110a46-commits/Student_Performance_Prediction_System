package com.spps.model;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String rollNumber;

    @Column(nullable = false)
    private String department;

    /** Attendance percentage, 0-100 */
    private double attendance;

    /** Average study hours per day, 0-24 */
    private double studyHours;

    /** Previous examination marks, 0-100 */
    private double previousMarks;

    /** Assignment score, 0-100 */
    private double assignmentScore;

    /** Internal marks, 0-100 */
    private double internalMarks;

    /** Number of academic activities joined, 0-10 */
    private int activities;

    /** Predicted score, 0-100 */
    private double predictedScore;

    /** LOW, AVERAGE or HIGH */
    @Column(nullable = false)
    private String performanceCategory;

    /** How sure the ML model is about the category (0-1). Empty when the rule-based fallback was used. */
    private Double confidence;

    /** "ML model" or "Rule-based fallback" */
    private String predictionSource;

    public Student() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public double getAttendance() { return attendance; }
    public void setAttendance(double attendance) { this.attendance = attendance; }
    public double getStudyHours() { return studyHours; }
    public void setStudyHours(double studyHours) { this.studyHours = studyHours; }
    public double getPreviousMarks() { return previousMarks; }
    public void setPreviousMarks(double previousMarks) { this.previousMarks = previousMarks; }
    public double getAssignmentScore() { return assignmentScore; }
    public void setAssignmentScore(double assignmentScore) { this.assignmentScore = assignmentScore; }
    public double getInternalMarks() { return internalMarks; }
    public void setInternalMarks(double internalMarks) { this.internalMarks = internalMarks; }
    public int getActivities() { return activities; }
    public void setActivities(int activities) { this.activities = activities; }
    public double getPredictedScore() { return predictedScore; }
    public void setPredictedScore(double predictedScore) { this.predictedScore = predictedScore; }
    public String getPerformanceCategory() { return performanceCategory; }
    public void setPerformanceCategory(String performanceCategory) { this.performanceCategory = performanceCategory; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public String getPredictionSource() { return predictionSource; }
    public void setPredictionSource(String predictionSource) { this.predictionSource = predictionSource; }
}
