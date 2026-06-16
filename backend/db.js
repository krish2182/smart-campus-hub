// backend/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a robust connection pool optimized for cloud environments
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    
    // Cloud Optimization Settings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000, // Elevated timeout for cloud network routing latency
    acquireTimeout: 20000,
    
    // Crucial for secure cloud-to-cloud handshakes
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;