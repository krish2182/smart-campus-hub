// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Get token from the request header
    const token = req.header('Authorization');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    try {
        // Verify token (strip out "Bearer " if it's sent that way from frontend)
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
        
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        // Attach user info to the request object
        req.user = decoded;
        next(); // Move to the next function/controller
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid.' });
    }
};