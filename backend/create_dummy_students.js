const db = require('./config/db');

const courses = ['MBA Tech', 'B.Tech CE', 'B.Tech AIML', 'B.Tech Data Science', 'B.Tech CS', 'Pharmacy'];
const genders = ['Male', 'Female'];
const firstNamesM = ['Aarav', 'Vihaan', 'Advik', 'Kabir', 'Aryan', 'Rohan', 'Krish', 'Reyansh', 'Aarush', 'Darsh', 'Dev', 'Rahul', 'Arjun', 'Rishi', 'Karan', 'Akash', 'Aditya', 'Vikram'];
const firstNamesF = ['Ananya', 'Diya', 'Anika', 'Navya', 'Saanvi', 'Aadhya', 'Pari', 'Kavya', 'Neha', 'Prisha', 'Isha', 'Ria', 'Pooja', 'Priya', 'Sara', 'Aditi', 'Shreya', 'Tanya'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Mehta', 'Jain', 'Agarwal', 'Kapoor', 'Reddy', 'Patel', 'Das', 'Roy', 'Nair', 'Rao', 'Yadav', 'Joshi', 'Mishra', 'Chauhan'];

// student123 hash
const passwordHash = '$2b$10$oEWEEwFCuePpfRhAje22pOcPeYheebp7PQ0Hjb5kBQhmGaWKB5H2a';

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

async function createStudents() {
    console.log("Starting to insert 100 random students...");
    let inserted = 0;
    for (let i = 1; i <= 100; i++) {
        const gender = genders[getRandomInt(genders.length)];
        const firstNameList = gender === 'Male' ? firstNamesM : firstNamesF;
        const firstName = firstNameList[getRandomInt(firstNameList.length)];
        const lastName = lastNames[getRandomInt(lastNames.length)];
        
        const name = `${firstName} ${lastName}`;
        // Add random number to email to avoid unique constraint collisions easily
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(10000)}@nmims.edu`;
        const course = courses[getRandomInt(courses.length)];
        const year = getRandomInt(4) + 1; // 1 to 4

        try {
            await db.execute(
                `INSERT INTO users (name, email, password, role, course, gender, year_of_study, hostel_id) 
                 VALUES (?, ?, ?, 'Student', ?, ?, ?, NULL)`,
                [name, email, passwordHash, course, gender, year]
            );
            inserted++;
        } catch (err) {
            console.error(`Failed to insert ${email}:`, err.message);
        }
    }
    console.log(`Successfully inserted ${inserted} students.`);
    process.exit(0);
}

createStudents();
