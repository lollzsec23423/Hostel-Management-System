const mysql = require('mysql2/promise');

const menuData = [
    // Day 1
    { day: 1, type: 'Breakfast', items: 'Aloo Puri, Bread Butter / Bread butter jam, Tea/coffee/ milk' },
    { day: 1, type: 'Lunch', items: 'Bhendi do pyaza, Amritsari rajma masala, Plain Dal, steam rice, Tandoori Roti/chapatti, Tandoor Roasted Papad, Mix Pickle, curd' },
    { day: 1, type: 'Dinner', items: 'Pumkin soup, Punjabi chole masala, Dal Tadka, Steam rice, tandoori roti, Chapati, Salad, Tandoor Roasted Papad, Mix Pickle, Sev boondi' },
    // Day 2
    { day: 2, type: 'Breakfast', items: 'Mendu Wada, Sev kanda poha, Tea/coffee/ milk' },
    { day: 2, type: 'Lunch', items: 'Gobhi tomato adraki, Sprouted matki usal, Dal fry, Jeera rice, Tandoori Roti/chapatti, salad, Tandoor Roasted Papad, Mix Pickle, lassi' },
    { day: 2, type: 'Dinner', items: 'Veg Lentil soup, Palak paneer, Dal fry, Steam rice, Tandoori Roti, chapati, Salad, Tandoor Roasted Papad, Mix Pickle, Besan ladoo' },
    // Day 3
    { day: 3, type: 'Breakfast', items: 'Aloo Paratha, Upma, Tea/coffee/ milk' },
    { day: 3, type: 'Lunch', items: 'Veg kolhapuri, Aloo methi dry, White kadi, Peas pulav, Tandoori Roti, chapati, salad, Tandoor Roasted Papad, Mix Pickle, raita' },
    { day: 3, type: 'Dinner', items: 'Coriander & tomato shorba, Veg kofta in red gravy, Dal tadka, Steam rice, soyabin pulav, Tandoori roti, chapatii, Tandoori Roasted papad, Salad, Dry fruit sheera' },
    // Day 4
    { day: 4, type: 'Breakfast', items: 'Kachori chutney, Sabudana khichidi, Tea/coffee/ milk' },
    { day: 4, type: 'Lunch', items: 'Chole Amritsari, Bharta baingan, Mix dal, Steam rice, Poori, Chapatti, salad, Mix Pickle, Butter milk' },
    { day: 4, type: 'Dinner', items: 'Vegetable tawa subji, Punjabi chawli masala, Dal fry, Mint rice, Steam rice, Tandoori Roti, chapati, Salad, Mix Pickle, mohanthal' },
    // Day 5
    { day: 5, type: 'Breakfast', items: 'Bread pakoda, Poha, Tea/coffee/ milk' },
    { day: 5, type: 'Lunch', items: 'Bhendi tomato capsicum, Kashmiri dum aloo, rassam, steam rice, Chapatti, Tandoori roti, salad, Mix Pickle, Tandoor Roasted Papad' },
    { day: 5, type: 'Dinner', items: 'Veg minestrone soup, Sev bhaji, Dal Khichidi, Kadi yellow, Tandoori Roti, chapati, Mix Salad, Tandoor Roasted Papad, Mix Pickle, Gud jalebi' },
    // Day 6
    { day: 6, type: 'Breakfast', items: 'Idli Sambhar, Uttapam/Tomato & Onion, Tea/coffee/ milk' },
    { day: 6, type: 'Lunch', items: 'Boondi raita, Moong sprouted dry, Baingan masala semi gravy, Dal Makhni, Cumin rice, Tandoori Roti, chapati, Tandoor Roasted Papad, Mix Pickle, Plain curd' },
    { day: 6, type: 'Dinner', items: 'Pav Bhaji, kheer, Veg tawa pulav, Chop onion, Dice lemon, Mix Pickle' },
    // Day 7
    { day: 7, type: 'Breakfast', items: 'Samosa chutney, Khaman dhokla, Tea/coffee/ milk' },
    { day: 7, type: 'Lunch', items: 'Aloo mutter, Kadi pakoda, Plain Rice, Tandoori Roti, chapati, mix salad, Mix Pickle, Lemon juice' },
    { day: 7, type: 'Dinner', items: 'Moogdal palak, Besan gatte ki subji, Shezwan fried rice, Steam rice, Dal tadka, Tandoori Roti, chapati, Salad, Tandoor Roasted Papad, Mix Pickle, Gulab Jamun' },
    // Day 8
    { day: 8, type: 'Breakfast', items: 'Vada pav, Missal pav, Tea/coffee/ milk' },
    { day: 8, type: 'Lunch', items: 'Cabbage poriyal, Black chana masala, Dal palak, Tadka rice, Steam rice, Tandoori Roti, chapati, Mix salad, Tandoor Roasted Papad, Mix Pickle, Mint juice, Jeera chaas' },
    { day: 8, type: 'Dinner', items: 'Veg lemon corriender soup, Malai kofta yellow gravy, Dal makhani, Jeera rice, Tandoori Roti, chapati, Salad, Tandoor Roasted Papad, Mix Pickle, Sevai kheer' },
    // Day 9
    { day: 9, type: 'Breakfast', items: 'Kachori chutney, Sabudana khichidi, Tea/coffee/ milk' },
    { day: 9, type: 'Lunch', items: 'Gilka tomato mutter, Corn capsicum makhani, Mix dal, Lemon rice, Steam rice, Tandoori Roti, chapati, salad, Mix Pickle, Plain Butter milk' },
    { day: 9, type: 'Dinner', items: 'Cream of palak soup, Veg jalfrezi, Singapore fried rice, Dal fry, Steam Rice, Tandoori Roti, chapati, Salad, Tandoor Roasted Papad, Mix Pickle, Coconut barfi' },
    // Day 10
    { day: 10, type: 'Breakfast', items: 'Medu wada, Chutney, Sambhar, Poha aloo, Tea/coffee/ milk' },
    { day: 10, type: 'Lunch', items: 'French Beans poriyal, Rajma masala, Surti gujarati dal, steam rice, Tandoori Roti, chapati, Salad, Tandoor Roasted Papad, Mix Pickle' },
    { day: 10, type: 'Dinner', items: 'Cream of tomato soup, Soyabean dry, Ragda masala, Dal adraki, Jeera pulav, Tandoori Roti, chapati, Salad, Tandoor Roasted Papad, Mix Pickle' },
    // Day 11
    { day: 11, type: 'Breakfast', items: 'Bread pakoda, Chutney, Sev poha, Tea/coffee/ milk' },
    { day: 11, type: 'Lunch', items: 'Turiya mutiya watana, Moong rasilla, Dal Fry, Tomato Rice, Tandoori Roti, chapati, Tandoor Roasted Papad, Mix Pickle, curd' },
    { day: 11, type: 'Dinner', items: 'Veg Mulligatawny soup, Veg makhanwala, Plain dal, Coriander rice, Steam rice, Tandoori Roti, chapati, Salad, Mix Pickle, Moongdal sheera' },
    // Day 12
    { day: 12, type: 'Breakfast', items: 'Idli chutney, Uttapam Sambhar, Tea/coffee/ milk' },
    { day: 12, type: 'Lunch', items: 'Chole masala, Tomato Bharta, Dal Fry, Rice, Chapatti, Poori, Salad, Tandoor Roasted Papad, Mix Pickle, Mint juice' },
    { day: 12, type: 'Dinner', items: 'Vegetable manchow soup, Dudhi tomato dry, methi malai mutter, Dal fry, Masala baath, Steam Rice, Tandoori Roti, chapati, Salad, Tandoor Roasted Papad, Mix Pickle, jalebi' },
    // Day 13
    { day: 13, type: 'Breakfast', items: 'Aloo gobi Paratha with curd, Sevai Upma, Tea/coffee/ milk' },
    { day: 13, type: 'Lunch', items: 'Paneer makhanwala, Red pumkin dry, Lasooni Dal, Rice, Tandoori Roti/chapatti, Salad, Mix Pickle, raita' },
    { day: 13, type: 'Dinner', items: 'Veg hot & sour soup, Veg Manchurian dry/soyabin chilli dry, Vegetable fried rice, Kaju vaal ki subji/kathol dal, Chapatti, Mix Pickle, Salad, ladoo' },
    // Day 14
    { day: 14, type: 'Breakfast', items: 'Khaman dhokla chutney, Kanda Poha, Tea/coffee/ milk' },
    { day: 14, type: 'Lunch', items: 'Veg hydrabadi, Tondli ki subji, Steam rice, Jeera rice, Dal Fry, Tandoori Roti, chapati, salad, Tandoor Roasted Papad, Mix Pickle, Masala butter milk' },
    { day: 14, type: 'Dinner', items: 'Vegetable clear soup, Dal baati, Aloo ki subji, Masala rice, chutney, Rice, chapatti, Salad, Tandoor Roasted Papad, Mix Pickle, churma' },
];

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'svkm_hostel_db'
        });

        console.log("Connected to DB");

        await conn.execute('DROP TABLE IF EXISTS mess_menu');

        await conn.execute(`CREATE TABLE mess_menu (
            id INT AUTO_INCREMENT PRIMARY KEY,
            day_number INT NOT NULL,
            meal_type ENUM('Breakfast', 'Lunch', 'Dinner') NOT NULL,
            items TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY (day_number, meal_type)
        )`);

        console.log("Created cyclic mess_menu table");

        for (let m of menuData) {
            await conn.execute(
                'INSERT INTO mess_menu (day_number, meal_type, items) VALUES (?, ?, ?)',
                [m.day, m.type, m.items]
            );
        }

        console.log("Successfully seeded 14-day cyclic menu!");
        await conn.end();
    } catch (err) {
        console.error("Migration failed", err);
    }
}
run();
