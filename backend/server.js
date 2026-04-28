require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hostels', require('./routes/hostel'));
app.use('/api/rooms', require('./routes/room'));
app.use('/api/mess', require('./routes/mess'));
app.use('/api/complaints', require('./routes/complaint'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dc', require('./routes/dcRoutes'));
app.use('/api/damages', require('./routes/damageRoutes'));
app.use('/api/outings', require('./routes/outingRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
