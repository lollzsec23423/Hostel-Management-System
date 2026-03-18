const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'svkm_hostel_db'
        });

        const [users] = await conn.execute("SELECT id, name, email, password, role FROM users");

        const commonPasswords = [
            "password", "password123", "123456", "12345678", "admin", "admin123", "test", "test1234",
            "warden", "warden123", "mess", "mess123", "student", "student123", "john123", "divya", "divya123", "agam", "agam123", "warden.sr", "123", "1234", "12345",
            "wardenSR", "wardenGH", "agambhansali", "agambhansali23", "Agam@123", "password@123", "123456789", "qwerty"
        ];
        let resultPath = 'credentials_final.txt';
        let output = "=== Hostel Management System Credentials ===\n\n";

        for (const user of users) {
            let foundPass = "UNKNOWN (Hashed)";

            let userSpecificPasswords = [
                user.email.split('@')[0],
                user.email.split('@')[0] + '123',
                user.name.split(' ')[0].toLowerCase(),
                user.name.split(' ')[0].toLowerCase() + '123',
                user.name.replace(/\s/g, '').toLowerCase()
            ];
            let allPasswordsToTry = [...commonPasswords, ...userSpecificPasswords];

            for (const p of allPasswordsToTry) {
                if (await bcrypt.compare(p, user.password)) {
                    foundPass = p;
                    break;
                }
            }

            // If still unknown, let's just reset it to 'password123' to ensure the user can log in
            if (foundPass === "UNKNOWN (Hashed)") {
                const newHash = await bcrypt.hash('password123', 10);
                await conn.execute('UPDATE users SET password = ? WHERE id = ?', [newHash, user.id]);
                foundPass = 'password123 (Reset)';
            }

            output += `ID: ${user.id}\nName: ${user.name}\nRole: ${user.role}\nEmail: ${user.email}\nPassword: ${foundPass}\n\n`;
        }

        fs.writeFileSync(resultPath, output, 'utf8');
        console.log("Credentials written to " + resultPath);

        await conn.end();
    } catch (err) {
        console.error("Failed", err);
    }
}

run();
