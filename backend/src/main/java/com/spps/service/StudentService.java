package com.spps.service;

import com.spps.dto.RecalculateResult;
import com.spps.dto.StudentRequest;
import com.spps.model.Student;
import com.spps.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository repository;
    private final PredictionService predictionService;

    public StudentService(StudentRepository repository, PredictionService predictionService) {
        this.repository = repository;
        this.predictionService = predictionService;
    }

    public List<Student> findAll() {
        return repository.findAll();
    }

    public Student findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
    }

    public Student create(StudentRequest req) {
        String roll = req.rollNumber().trim();
        if (repository.existsByRollNumberIgnoreCase(roll)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A student with roll number " + roll + " already exists");
        }
        Student s = new Student();
        copyFields(s, req);
        predictionService.applyPrediction(s);
        return repository.save(s);
    }

    @Transactional
    public Student update(Long id, StudentRequest req) {
        Student s = findById(id);
        String roll = req.rollNumber().trim();
        if (repository.existsByRollNumberIgnoreCaseAndIdNot(roll, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Another student already has roll number " + roll);
        }
        copyFields(s, req);
        predictionService.applyPrediction(s);
        return repository.save(s);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        repository.deleteById(id);
    }

    /** Runs the prediction again for every student, for example after the ML service was started. */
    @Transactional
    public RecalculateResult recalculateAll() {
        List<Student> students = repository.findAll();
        int byMl = 0;
        for (Student s : students) {
            predictionService.applyPrediction(s);
            if (PredictionService.SOURCE_ML.equals(s.getPredictionSource())) byMl++;
        }
        repository.saveAll(students);
        return new RecalculateResult(students.size(), byMl);
    }

    private void copyFields(Student s, StudentRequest req) {
        s.setName(req.name().trim());
        s.setRollNumber(req.rollNumber().trim());
        s.setDepartment(req.department().trim());
        s.setAttendance(req.attendance());
        s.setStudyHours(req.studyHours());
        s.setPreviousMarks(req.previousMarks());
        s.setAssignmentScore(req.assignmentScore());
        s.setInternalMarks(req.internalMarks());
        s.setActivities(req.activities());
    }
}
