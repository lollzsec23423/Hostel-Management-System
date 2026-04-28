async function testImport() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'warden@nmims.edu', password: 'warden123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        const importRes = await fetch('http://localhost:5000/api/rooms/hostel/occupancy/import', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sql: "INSERT IGNORE INTO rooms (id, hostel_id, room_number, capacity, occupied_seats, status) VALUES (999, 1, '999', 2, 0, 'Available');" })
        });

        if (!importRes.ok) {
            const errData = await importRes.text();
            console.error("API Error Response:", importRes.status, errData);
        } else {
            console.log("Success! Status:", importRes.status);
            const text = await importRes.text();
            console.log("Response:", text);
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}
testImport();
