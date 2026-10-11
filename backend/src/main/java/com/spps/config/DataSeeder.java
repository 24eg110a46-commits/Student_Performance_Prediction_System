package com.spps.config;

import com.spps.dto.StudentRequest;
import com.spps.model.AppUser;
import com.spps.repository.StudentRepository;
import com.spps.repository.UserRepository;
import com.spps.service.StudentService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Creates the default login and a few sample students the first time the app starts. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentService studentService;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, StudentRepository studentRepository,
                      StudentService studentService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.studentService = studentService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(new AppUser("admin", passwordEncoder.encode("admin123")));
        }
        if (studentRepository.count() == 0) {
            seed("Aarav Sharma", "CS101", "Computer Science", 92, 5.5, 88, 90, 85, 6);
            seed("Diya Reddy", "CS102", "Computer Science", 78, 3.5, 70, 72, 68, 3);
            seed("Rohan Mehta", "CS103", "Computer Science", 55, 1.5, 42, 48, 40, 0);
            seed("Ananya Iyer", "EC201", "Electronics", 96, 6.5, 93, 91, 94, 8);
            seed("Kabir Singh", "EC202", "Electronics", 68, 2.5, 61, 58, 63, 2);
            seed("Meera Nair", "EC203", "Electronics", 48, 1.0, 38, 35, 41, 1);
            seed("Vikram Rao", "ME301", "Mechanical", 85, 4.0, 76, 80, 74, 4);
            seed("Sneha Patel", "ME302", "Mechanical", 72, 3.0, 64, 66, 60, 2);
            seed("Arjun Das", "ME303", "Mechanical", 60, 2.0, 52, 45, 50, 1);
            seed("Priya Kulkarni", "CE401", "Civil", 90, 5.0, 82, 85, 80, 5);
            seed("Imran Khan", "CE402", "Civil", 64, 2.0, 55, 50, 58, 0);
            seed("Lakshmi Menon", "CE403", "Civil", 82, 4.5, 79, 77, 81, 3);
        }
    }

    private void seed(String name, String roll, String dept, double attendance, double study,
                      double previous, double assignment, double internal, int activities) {
        studentService.create(new StudentRequest(name, roll, dept, attendance, study,
                previous, assignment, internal, activities));
    }
}
