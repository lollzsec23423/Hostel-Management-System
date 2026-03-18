const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create sample tokens for different roles and hostels
const tokens = {
    // boy1@nmims.edu - Hostel: None (yet, let's pretend his booking goes to ID 1)
    studentBoy: jwt.sign({ id: 5, role: 'Student', email: 'boy1@nmims.edu', hostel_id: 1 }, process.env.JWT_SECRET || 'your_super_secret_key_here'),
    // divya@nmims.edu - Hostel: None (pretend ID 3)
    studentGirl: jwt.sign({ id: 11, role: 'Student', email: 'divya@nmims.edu', hostel_id: 3 }, process.env.JWT_SECRET || 'your_super_secret_key_here'),

    // warden@nmims.edu - First Year Boys Hostel (ID 1)
    wardenBoys: jwt.sign({ id: 7, role: 'Warden', email: 'warden@nmims.edu', hostel_id: 1 }, process.env.JWT_SECRET || 'your_super_secret_key_here'),
    // warden.gh@nmims.edu - Girls Hostel (ID 3)
    wardenGirls: jwt.sign({ id: 10, role: 'Warden', email: 'warden.gh@nmims.edu', hostel_id: 3 }, process.env.JWT_SECRET || 'your_super_secret_key_here')
};

console.log(JSON.stringify(tokens, null, 2));
