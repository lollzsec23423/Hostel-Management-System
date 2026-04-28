const db = require('./config/db');

async function testEscape() {
    try {
        console.log("Escape test:", typeof db.escape);
        const escaped = db.escape("Test string's quote");
        console.log("Escaped:", escaped);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}
testEscape();
