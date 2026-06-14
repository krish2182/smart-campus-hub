// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware'); // Security guard

// Student Route (Protected: Requires a valid token)
router.post('/create', auth, projectController.createProject);

// Professor Routes (Both protected by auth middleware)
router.get('/faculty-queue', auth, projectController.getProfessorProjects);
router.put('/review/:projectId', auth, projectController.updateProjectStatus);

module.exports = router;