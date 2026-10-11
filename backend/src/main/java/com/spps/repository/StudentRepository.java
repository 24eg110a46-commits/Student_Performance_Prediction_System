package com.spps.repository;

import com.spps.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByRollNumberIgnoreCase(String rollNumber);

    boolean existsByRollNumberIgnoreCaseAndIdNot(String rollNumber, Long id);
}
