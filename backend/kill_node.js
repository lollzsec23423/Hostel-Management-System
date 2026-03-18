const { execSync } = require('child_process');
try {
    execSync('taskkill /IM node.exe /F');
} catch (e) { }
