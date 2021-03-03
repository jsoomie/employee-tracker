CREATE DATABASE company;

USE company;

CREATE TABLE department(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE role(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(50),
    salary DECIMAL(10,4),
    department_id INT
);

CREATE TABLE employee(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role_id INT,
    manager_id INT
);