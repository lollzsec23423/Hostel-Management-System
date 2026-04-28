const db = require('./config/db');

const destinations = ['Local Market', 'Railway Station', 'Airport', 'Hospital', 'Home Town', 'Relative House in City', 'Shopping Mall'];
const reasons = [
    'Need to buy essential groceries and stationery.',
    'Going to hometown for the weekend.',
    'Medical checkup appointment.',
    'Family function to attend.',
    'Dropping off a friend at the station.',
    'Buying a new laptop/electronics.',
    'Weekend outing with local guardians.'
];
const statuses = ['Pending', 'Approved', 'Rejected', 'Completed'];

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Generate a random date within the next 7 days
function getRandomFutureDate() {
    const date = new Date();
    date.setDate(date.getDate() + getRandomInt(7));
    date.setHours(8 + getRandomInt(10), 0, 0, 0); // between 8 AM and 6 PM
    return date;
}

// Format date for MySQL DATETIME
function formatDatetime(dateObj) {
    return dateObj.toISOString().slice(0, 19).replace('T', ' ');
}

async function createOutings() {
    console.log("Starting to generate random outings...");

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get 20 random students
        const [students] = await connection.execute("SELECT id, name FROM users WHERE role = 'Student' ORDER BY RAND() LIMIT 20");
        console.log(`Selected ${students.length} random students for outings.`);

        let insertedCount = 0;

        for (const student of students) {
            const destination = destinations[getRandomInt(destinations.length)];
            const reason = reasons[getRandomInt(reasons.length)];
            
            const statusRoll = Math.random();
            const status = statusRoll < 0.4 ? 'Pending' : (statusRoll < 0.7 ? 'Approved' : (statusRoll < 0.9 ? 'Rejected' : 'Completed'));

            const departureDate = getRandomFutureDate();
            // Return date is 1 to 3 days after departure
            const returnDate = new Date(departureDate);
            returnDate.setDate(returnDate.getDate() + 1 + getRandomInt(3));

            await connection.execute(
                `INSERT INTO outings (student_id, destination, reason, departure_date, return_date, status) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [student.id, destination, reason, formatDatetime(departureDate), formatDatetime(returnDate), status]
            );

            insertedCount++;
        }

        await connection.commit();
        console.log(`Successfully inserted ${insertedCount} outing requests.`);

    } catch (err) {
        await connection.rollback();
        console.error("Error creating outings:", err.message);
    } finally {
        connection.release();
        process.exit(0);
    }
}

createOutings();
