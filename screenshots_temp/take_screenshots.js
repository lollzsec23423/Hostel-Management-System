const puppeteer = require('puppeteer');
const path = require('path');

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
    try {
        const desktopPath = "c:\\Users\\agamb\\Desktop\\hostel management system\\";
        const browser = await puppeteer.launch({
            headless: "new",
            defaultViewport: { width: 1280, height: 800 },
            args: ['--allow-file-access-from-files', '--disable-web-security']
        });

        const page = await browser.newPage();

        const takeShot = async (name) => {
            const outPath = path.join(desktopPath, name);
            await page.screenshot({ path: outPath, fullPage: true });
            console.log("Saved: " + name);
        };

        const baseUrl = "file:///c:/Users/agamb/Desktop/hostel%20management%20system/frontend/index.html";

        console.log("Navigating to Homepage / Login...");
        await page.goto(baseUrl + "#!/login", { waitUntil: 'networkidle2' });
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await delay(1000);
        await takeShot('1_Homepage_Login.png');

        console.log("Navigating to Register form...");
        await page.goto(baseUrl + "#!/register", { waitUntil: 'networkidle2' });
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await delay(1000);
        await takeShot('2_Forms_Register.png');

        console.log("Logging in as Admin...");
        await page.goto(baseUrl + "#!/login", { waitUntil: 'networkidle2' });
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'admin.main@nmims.edu');
        await page.type('input[type="password"]', 'tempAdmin123');
        await page.click('button[type="submit"]');

        await delay(2000);
        await takeShot('3_Output_AdminDashboard.png');

        console.log("Navigating to Admin Hostels & Rooms...");
        await page.goto(baseUrl + "#!/admin/hostels", { waitUntil: 'networkidle2' });
        await delay(1500);

        const hostels = await page.$$('tbody tr');
        if (hostels.length > 0) {
            console.log("Clicking first hostel to open Add Room form...");
            await hostels[0].click();
            await delay(1500);
            await takeShot('4_Forms_AddRoom.png');
        }

        console.log("Logging in as Student...");
        await page.evaluate(() => localStorage.clear());
        await page.goto(baseUrl + "#!/login", { waitUntil: 'networkidle2' });
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'student1@nmims.edu');
        await page.type('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        await delay(2000);
        await takeShot('5_Output_StudentDashboard.png');

        console.log("Logging in as Warden...");
        await page.evaluate(() => localStorage.clear());
        await page.goto(baseUrl + "#!/login", { waitUntil: 'networkidle2' });
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'warden.sr@nmims.edu');
        await page.type('input[type="password"]', 'tempWarden123');
        await page.click('button[type="submit"]');

        await delay(2000);
        await takeShot('6_Output_WardenDashboard.png');

        console.log("All screenshots generated successfully!");
        await browser.close();
    } catch (e) {
        console.error("Error occurred:", e);
        process.exit(1);
    }
})();
