const db = require('./config/db');

const categories = ['Electricity', 'Water', 'Cleanliness', 'Internet', 'Other'];
const statuses = ['Pending', 'In Progress', 'Resolved'];

const complaintData = {
    'Electricity': [
        { title: 'Fan not working', desc: 'The ceiling fan is making a weird noise and stops randomly.' },
        { title: 'Tube light flickering', desc: 'The tube light is constantly flickering, making it hard to study.' },
        { title: 'Power socket broken', desc: 'The charging socket near the bed is loose and sparking.' }
    ],
    'Water': [
        { title: 'No hot water', desc: 'Geyser is not dispensing hot water in the morning.' },
        { title: 'Leaking tap', desc: 'The washbasin tap has been leaking constantly overnight.' },
        { title: 'Low water pressure', desc: 'The shower has very low water pressure.' }
    ],
    'Cleanliness': [
        { title: 'Room not cleaned', desc: 'The sweeping staff skipped our room for the last 3 days.' },
        { title: 'Dustbin overflowing', desc: 'The corridor dustbin is overflowing and smells bad.' },
        { title: 'Cobwebs in corner', desc: 'There are large cobwebs near the window that need clearing.' }
    ],
    'Internet': [
        { title: 'WiFi disconnects', desc: 'The Wi-Fi drops connection every 10 minutes.' },
        { title: 'Extremely slow speed', desc: 'Internet speed is very slow, unable to attend online classes.' },
        { title: 'LAN port broken', desc: 'The ethernet port on the wall is damaged and doesn\'t click in.' }
    ],
    'Other': [
        { title: 'Window lock broken', desc: 'The window lock is broken, causing a security concern.' },
        { title: 'Door handle loose', desc: 'The main door handle is extremely loose and might come off.' },
        { title: 'Loud noise from adjacent room', desc: 'Students in the next room play loud music late at night.' }
    ]
};

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

async function createComplaints() {
    console.log("Starting to generate random complaints...");

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get 30 random students
        const [students] = await connection.execute("SELECT id, name FROM users WHERE role = 'Student' ORDER BY RAND() LIMIT 30");
        console.log(`Selected ${students.length} random students to file complaints.`);

        let insertedCount = 0;

        for (const student of students) {
            const category = categories[getRandomInt(categories.length)];
            const dataList = complaintData[category];
            const data = dataList[getRandomInt(dataList.length)];
            
            // Bias status heavily towards Pending and In Progress to make the dashboard look active
            const statusRoll = Math.random();
            const status = statusRoll < 0.6 ? 'Pending' : (statusRoll < 0.85 ? 'In Progress' : 'Resolved');

            let resolutionComment = null;
            if (status === 'Resolved') {
                resolutionComment = 'Issue has been fixed by the maintenance team.';
            }

            await connection.execute(
                `INSERT INTO complaints (student_id, category, title, description, status, resolution_comment) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [student.id, category, data.title, data.desc, status, resolutionComment]
            );

            insertedCount++;
        }

        await connection.commit();
        console.log(`Successfully inserted ${insertedCount} complaints.`);

    } catch (err) {
        await connection.rollback();
        console.error("Error creating complaints:", err.message);
    } finally {
        connection.release();
        process.exit(0);
    }
}

createComplaints();
