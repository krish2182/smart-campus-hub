// backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
app.use(cors());
app.use(express.json());

// Import Routes (Strict Lowercase Paths to Match Linux File System)
const authRoutes = require('./routes/authroutes');
const projectRoutes = require('./routes/projectroutes'); 

// Mount API Routes to Endpoint Hubs
app.use('/api/auth', authRoutes); 
app.use('/api/projects', projectRoutes);

// Base Deployment Verification Route
app.get('/', (req, res) => {
    res.send('Smart Campus Hub Backend API is running smoothly on the cloud! 🚀');
});

// Database Gateway Integrity Check Route
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ message: 'Successfully connected to MySQL Database!', data: rows });
    } catch (error) {
        res.status(500).json({ message: 'Database connection failed.', error: error.message });
    }
});

// Start Runtime Server Engine
app.listen(PORT, () => {
    console.log(`Server is blasting off on port ${PORT} 🚀`);
});