// backend/controllers/authController.js
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTER USER
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        // 1. Validation Check: Ensure no empty fields are sent
        if (!name || !email || !password || !role) {
            return res.status(400).json({ 
                message: 'Registration halted: Name, email, password, and role are strictly required.' 
            });
        }

        // 2. Role Verification Guard
        if (!['student', 'professor'].includes(role)) {
            return res.status(400).json({ 
                message: 'Registration halted: Invalid role assignment configuration.' 
            });
        }

        // 3. Duplicate Prevention: Check if the email already exists in MySQL
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ 
                message: 'An account with this email address is already registered on our campus servers.' 
            });
        }

        // 4. Cryptographic Hashing: Secure the raw password string
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 5. Data Layer Insertion: Save new user parameters into MySQL
        await db.query(
            'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
            [name, email, passwordHash, role, department || null]
        );

        // 6. Success Dispatch
        res.status(201).json({ 
            message: 'User account compiled and registered successfully!' 
        });

    } catch (error) {
        console.error('Registration runtime error:', error);
        res.status(500).json({ 
            message: 'Critical backend server initialization error during registration.', 
            error: error.message 
        });
    }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter both email and password.' });
        }

        // Check if user exists in MySQL
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const user = users[0];

        // Verify if the password matches the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Create a JWT Token containing user details (ID, Name, and Role)
        const token = jwt.sign(
            { id: user.user_id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token lasts for 1 day
        );

        // Send back success and user info (excluding password hash)
        res.json({
            token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
};