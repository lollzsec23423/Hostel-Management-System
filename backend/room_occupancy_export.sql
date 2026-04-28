-- INSERT Users (Students)
INSERT IGNORE INTO users (id, name, email, password, role, course, gender, year_of_study, hostel_id) VALUES (2, 'John Doe', 'john@nmims.edu', '$2b$10$oEWEEwFCuePpfRhAje22pOcPeYheebp7PQ0Hjb5kBQhmGaWKB5H2a', 'Student', 'B.Tech CS', 'Male', 1, NULL);
INSERT IGNORE INTO users (id, name, email, password, role, course, gender, year_of_study, hostel_id) VALUES (3, 'Jane Smith', 'jane@nmims.edu', '$2b$10$twWAIApqjsZ7cI/gG3521OVdS2ViiktfpnSWvBCiuYX3hqznQN5t.', 'Student', 'B.Tech AIML', 'Male', 1, NULL);
INSERT IGNORE INTO users (id, name, email, password, role, course, gender, year_of_study, hostel_id) VALUES (4, 'Mike Ross', 'mike@nmims.edu', '$2b$10$3hMk3zjQHPeh7bGBpvJgC.5CsYYzDwLHG8lwU9Tgsq/1mE0dDZO32', 'Student', 'MBA Tech', 'Male', 1, NULL);
INSERT IGNORE INTO users (id, name, email, password, role, course, gender, year_of_study, hostel_id) VALUES (5, 'New Boy First Year', 'boy1@nmims.edu', '$2b$10$VryEe7vbP8629Tsb4cT5eOIR9nlsfr.U1g5/2hVyHrbULXbKS01zq', 'Student', 'B.Tech CS', 'Male', 1, NULL);
INSERT IGNORE INTO users (id, name, email, password, role, course, gender, year_of_study, hostel_id) VALUES (6, 'agam', 'test@gmail.com', '$2b$10$0AdO9yPcynfez6LEPkFKteFGXk27HtCzDODKgADqDq1tANaw1iKES', 'Student', 'MBA Tech', 'Male', 1, 1);
INSERT IGNORE INTO users (id, name, email, password, role, course, gender, year_of_study, hostel_id) VALUES (11, 'divya', 'divya@nmims.edu', '$2b$10$z/XoV8tCYZu7kiG/DDLf3eHmUP3Tn7as/fP7s61gZjCJT2CcjNvoq', 'Student', 'MBA Tech', 'Female', 2, 3);
INSERT IGNORE INTO users (id, name, email, password, role, course, gender, year_of_study, hostel_id) VALUES (12, 'agam bhansali', 'agambhansali23@gmail.com', '$2b$10$/yDeAWch1ktHTHOgHv9Qd.SxK/yHyQkTpkTkHVt1Gg.7urYCFa9G.', 'Student', 'MBA Tech', 'Male', 2, 2);
INSERT IGNORE INTO users (id, name, email, password, role, course, gender, year_of_study, hostel_id) VALUES (13, 'test', 'test1@gmail.com', '$2b$10$H7PzVWZaaoYq639jxWhZguCOACgF.63/tg6SNSXXP9dgA7Z50.1EG', 'Student', 'MBA Tech', 'Male', 1, NULL);

-- INSERT Rooms
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (1, 1, '101', 2, 1, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (2, 1, '102', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (3, 1, '103', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (4, 1, '104', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (5, 1, '105', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (6, 1, '106', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (7, 2, '201', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (8, 2, '202', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (9, 2, '203', 2, 1, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (10, 2, '204', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (11, 2, '205', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (12, 2, '206', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (13, 3, '301', 2, 1, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (14, 3, '302', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (15, 3, '303', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (16, 3, '304', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (17, 3, '305', 2, 0, 'Available');
INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (18, 3, '306', 2, 2, 'Full');

-- INSERT Room Bookings
INSERT IGNORE INTO room_bookings (id, student_id, room_id, status) VALUES (1, 6, 1, 'Approved');
INSERT IGNORE INTO room_bookings (id, student_id, room_id, status) VALUES (2, 11, 13, 'Approved');
INSERT IGNORE INTO room_bookings (id, student_id, room_id, status) VALUES (3, 12, 9, 'Approved');

