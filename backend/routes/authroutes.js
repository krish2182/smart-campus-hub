// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route for registration: POST /api/auth/register
router.post('/register', authController.register);

// Route for login: POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;