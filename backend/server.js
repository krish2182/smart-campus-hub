// backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes'); 

// Use Routes
app.use('/api/auth', authRoutes); 
app.use('/api/projects', projectRoutes); // <-- Added this line to mount project endpoints

// Base Routes
app.get('/', (req, res) => {
    res.send('Smart Campus Hub Backend API is running smoothly!');
});

app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ message: 'Successfully connected to MySQL Database!', data: rows });
    } catch (error) {
        res.status(500).json({ message: 'Failed to connect.', error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is blasting off on port ${PORT} 🚀`);
});

