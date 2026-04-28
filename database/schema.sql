-- Create database
CREATE DATABASE IF NOT EXISTS svkm_hostel_db;
USE svkm_hostel_db;

// 1. Users Table (Students & Admins & Wardens & Mess Owners)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15) DEFAULT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Student', 'Admin', 'Warden', 'Mess Owner') DEFAULT 'Student',
    course ENUM('MBA Tech', 'B.Tech CE', 'B.Tech AIML', 'B.Tech Data Science', 'B.Tech CS', 'Pharmacy', 'None') DEFAULT 'None',
    gender ENUM('Male', 'Female') NOT NULL DEFAULT 'Male',
    year_of_study INT NOT NULL DEFAULT 1,
    hostel_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE SET NULL
);

-- 2. Hostels Table
CREATE TABLE IF NOT EXISTS hostels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('Boys', 'Girls') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hostel_id INT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 2,
    occupied_seats INT DEFAULT 0,
    status ENUM('Available', 'Full', 'Maintenance') DEFAULT 'Available',
    FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
    UNIQUE KEY (hostel_id, room_number)
);

-- 4. Room Bookings Table
CREATE TABLE IF NOT EXISTS room_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 5. Mess Menu Table
CREATE TABLE IF NOT EXISTS mess_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_date DATE NOT NULL,
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner') NOT NULL,
    items TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (menu_date, meal_type)
);

-- 6. Mess Attendance Table
CREATE TABLE IF NOT EXISTS mess_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner') NOT NULL,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (student_id, attendance_date, meal_type)
);

-- 7. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    category ENUM('Electricity', 'Water', 'Cleanliness', 'Internet', 'Other') NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    resolution_comment TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- DUMMY DATA INSERTION

-- Insert Admin, Warden, Mess Owner, and a few Students
INSERT INTO users (name, email, password, role, course, hostel_id) VALUES 
('Admin User', 'admin@nmims.edu', '$2b$10$qS/LgG6kypMIO5gIAOD9Xe.z7Qj7qgtVZOM/ogmdqbd9y7kmyIcxW', 'Admin', 'None', NULL), -- password is 'admin123'
('Warden User', 'warden@nmims.edu', '$2b$10$UnKiqyZdzX0i3zpDWXgBaeplamMQ9CNGwBjDA2ZDcCbJa25vKBcGC', 'Warden', 'None', 1), -- password is 'warden123'. Attached to First Year Boys Hostel
('Warden Senior', 'warden.sr@nmims.edu', '$2b$10$UdvC3.H4R72Kz5zAvy03DO/nmqW.p7jamMOEWwLVrvp81d0Zut6UW', 'Warden', 'None', 2), -- password is 'wardenSR' attached to Senior Boys Hostel
('Warden Girls', 'warden.gh@nmims.edu', '$2b$10$wN2tB80yw7yxEzmGjFEwauzqbXqY737GF3.YSpOTkhCDXScxrksP6', 'Warden', 'None', 3), -- password is 'wardenGH' attached to Girls Hostel
('Mess Owner', 'mess@nmims.edu', '$2b$10$ydxl6I4YOpHma1okuWc91OxX/8v5rtd2iKWedy9SptCYH.lb8ik.W', 'Mess Owner', 'None', NULL), -- password is 'mess123'
('John Doe', 'john@nmims.edu', '$2b$10$oEWEEwFCuePpfRhAje22pOcPeYheebp7PQ0Hjb5kBQhmGaWKB5H2a', 'Student', 'B.Tech CS', NULL), -- password is 'student123'
('Jane Smith', 'jane@nmims.edu', '$2b$10$twWAIApqjsZ7cI/gG3521OVdS2ViiktfpnSWvBCiuYX3hqznQN5t.', 'Student', 'B.Tech AIML', NULL),
('Mike Ross', 'mike@nmims.edu', '$2b$10$3hMk3zjQHPeh7bGBpvJgC.5CsYYzDwLHG8lwU9Tgsq/1mE0dDZO32', 'Student', 'MBA Tech', NULL);

-- Insert Hostels
INSERT INTO hostels (name, type) VALUES 
('First Year Boys Hostel', 'Boys'),
('Senior Boys Hostel', 'Boys'),
('Girls Hostel', 'Girls');

-- Insert Rooms (First Year Boys Hostel - ID 1)
INSERT INTO rooms (hostel_id, room_number, capacity, occupied_seats, status) VALUES 
(1, '101', 2, 0, 'Available'), (1, '102', 2, 0, 'Available'), (1, '103', 2, 0, 'Available'),
(1, '104', 2, 0, 'Available'), (1, '105', 2, 0, 'Available'), (1, '106', 2, 0, 'Available');

-- Insert Rooms (Senior Boys Hostel - ID 2)
INSERT INTO rooms (hostel_id, room_number, capacity, occupied_seats, status) VALUES 
(2, '201', 2, 0, 'Available'), (2, '202', 2, 0, 'Available'), (2, '203', 2, 0, 'Available'),
(2, '204', 2, 0, 'Available'), (2, '205', 2, 0, 'Available'), (2, '206', 2, 0, 'Available');

-- Insert Rooms (Girls Hostel - ID 3)
INSERT INTO rooms (hostel_id, room_number, capacity, occupied_seats, status) VALUES 
(3, '301', 2, 0, 'Available'), (3, '302', 2, 0, 'Available'), (3, '303', 2, 0, 'Available'),
(3, '304', 2, 0, 'Available'), (3, '305', 2, 0, 'Available'), (3, '306', 2, 2, 'Full');

-- Insert Sample Menu
INSERT INTO mess_menu (menu_date, meal_type, items) VALUES 
(CURDATE(), 'Breakfast', 'Poha, Jalebi, Tea, Coffee'),
(CURDATE(), 'Lunch', 'Roti, Dal Tadka, Paneer Butter Masala, Rice, Salad'),
(CURDATE(), 'Dinner', 'Naan, Dal Makhani, Mixed Veg, Gulab Jamun');

-- Insert Sample Complaints
INSERT INTO complaints (student_id, category, title, description, status) VALUES 
(2, 'Electricity', 'Fan not working', 'The ceiling fan in room 101 is making weird noises and stops frequently.', 'Pending'),
(3, 'Internet', 'Slow Wi-Fi', 'Wi-Fi speed is extremely slow on the 3rd floor of the Girls Hostel.', 'In Progress');

-- 8. Outings Table
CREATE TABLE IF NOT EXISTS outings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    destination VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    departure_date DATETIME NOT NULL,
    return_date DATETIME NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Completed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Disciplinary Cases Table (DC)
CREATE TABLE IF NOT EXISTS disciplinary_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    reason TEXT NOT NULL,
    action_taken ENUM('Warning', 'Fine', 'Suspension', 'YB') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Property Damages Table
CREATE TABLE IF NOT EXISTS property_damages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    item_damaged VARCHAR(150) NOT NULL,
    damage_cost DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Paid') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Maintenance Requests Table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    item_to_fix VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
