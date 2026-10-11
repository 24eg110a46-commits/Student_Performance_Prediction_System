-- Student Performance Prediction System - MySQL schema
--
-- You do NOT have to run this file: the Spring Boot backend creates the database and tables on first start
-- (spring.jpa.hibernate.ddl-auto=update). It is included so you can create the database by hand, show the
-- table design in a report, or set things up on a server where the app user cannot create databases.
--
--   mysql -u root -p < database/schema.sql
--
-- The default login (admin / admin123) and the sample students are added by the backend on first start.

CREATE DATABASE IF NOT EXISTS student_performance
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE student_performance;

CREATE TABLE IF NOT EXISTS app_users (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    username      VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,   -- BCrypt hash, never the plain password
    PRIMARY KEY (id),
    UNIQUE KEY uk_app_users_username (username)
);

CREATE TABLE IF NOT EXISTS students (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    name                  VARCHAR(255) NOT NULL,
    roll_number           VARCHAR(255) NOT NULL,
    department            VARCHAR(255) NOT NULL,
    attendance            DOUBLE       NOT NULL,   -- percentage, 0-100
    study_hours           DOUBLE       NOT NULL,   -- hours per day, 0-24
    previous_marks        DOUBLE       NOT NULL,   -- 0-100
    assignment_score      DOUBLE       NOT NULL,   -- 0-100
    internal_marks        DOUBLE       NOT NULL,   -- 0-100
    activities            INT          NOT NULL,   -- academic activities joined, 0-10
    predicted_score       DOUBLE       NOT NULL,   -- 0-100, from the ML model
    performance_category  VARCHAR(255) NOT NULL,   -- LOW, AVERAGE or HIGH
    confidence            DOUBLE       NULL,       -- model confidence, 0-1 (NULL when fallback was used)
    prediction_source     VARCHAR(255) NULL,       -- 'ML model' or 'Rule-based fallback'
    PRIMARY KEY (id),
    UNIQUE KEY uk_students_roll_number (roll_number)
);
