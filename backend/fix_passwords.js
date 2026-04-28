const bcrypt = require('bcrypt');
const db = require('./config/db');

async function fixPasswords() {
    try {
        // Generate the real hash for "student123"
        const salt = await bcrypt.genSalt(10);
        const correctHash = await bcrypt.hash('student123', salt);
        
        console.log("Correct hash for student123:", correctHash);

        // The incorrect hash that is currently in the DB
        const incorrectHashString = '$2b$10$oEWEEwFCuePpfRhAje22pOcPeYheebp7PQ0Hjb5kBQhmGaWKB5H2a';

        // Update all users seamlessly
        const [result] = await db.execute(
            'UPDATE users SET password = ? WHERE password = ?',
            [correctHash, incorrectHashString]
        );

        console.log(`Successfully updated ${result.affectedRows} dummy users to use "student123"`);
        process.exit(0);

    } catch (err) {
        console.error("Error fixing passwords:", err);
        process.exit(1);
    }
}

fixPasswords();
