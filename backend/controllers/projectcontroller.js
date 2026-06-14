// backend/controllers/projectController.js
const db = require('../db');

// 1. CREATE NEW PROJECT (Student Feature)
exports.createProject = async (req, res) => {
    // Ensure only students can initiate a project proposal
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Access denied. Only students can propose projects.' });
    }

    // Start a transaction so if any insert fails, MySQL rolls back completely
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const { title, description, tech_stack, academic_year, guide_id, team_members } = req.body;

        if (!title || !academic_year || !guide_id) {
            return res.status(400).json({ message: 'Title, Academic Year, and Faculty Guide are required.' });
        }

        // 1. Insert into the main projects table
        const [projectResult] = await connection.query(
            'INSERT INTO projects (title, description, tech_stack, academic_year, guide_id) VALUES (?, ?, ?, ?, ?)',
            [title, description, tech_stack, academic_year, guide_id]
        );

        const projectId = projectResult.insertId;

        // 2. Automatically link the creator student to this project in the bridge table
        await connection.query(
            'INSERT INTO project_members (project_id, student_id) VALUES (?, ?)',
            [projectId, req.user.id]
        );

        // 3. Optional: Link other team members if provided in an array of user IDs
        if (team_members && Array.isArray(team_members)) {
            for (let studentId of team_members) {
                await connection.query(
                    'INSERT INTO project_members (project_id, student_id) VALUES (?, ?)',
                    [projectId, studentId]
                );
            }
        }

        // Commit transaction to save changes permanently to MySQL
        await connection.commit();
        res.status(201).json({ message: 'Project proposal submitted successfully!', projectId });

    } catch (error) {
        await connection.rollback();
        console.error('Project creation error:', error);
        res.status(500).json({ message: 'Failed to submit project.', error: error.message });
    } finally {
        connection.release();
    }
};

// 2. GET PROJECTS FOR A SPECIFIC FACULTY GUIDE (Professor Feature)
exports.getProfessorProjects = async (req, res) => {
    // Ensure only professors can view this queue
    if (req.user.role !== 'professor') {
        return res.status(403).json({ message: 'Access denied. Faculty role required.' });
    }

    try {
        // Query to find projects where guide_id matches the logged-in professor's ID
        // We use a LEFT JOIN to pull the names of the students assigned to each project
        const [projects] = await db.query(
            `SELECT p.*, GROUP_CONCAT(u.name SEPARATOR ', ') AS team_members 
             FROM projects p
             LEFT JOIN project_members pm ON p.project_id = pm.project_id
             LEFT JOIN users u ON pm.student_id = u.user_id
             WHERE p.guide_id = ?
             GROUP BY p.project_id`, 
            [req.user.id]
        );

        res.json(projects);
    } catch (error) {
        console.error('Fetch faculty projects error:', error);
        res.status(500).json({ message: 'Failed to retrieve projects.', error: error.message });
    }
};

// 3. UPDATE PROJECT STATUS (Professor Feature)
exports.updateProjectStatus = async (req, res) => {
    if (req.user.role !== 'professor') {
        return res.status(403).json({ message: 'Access denied. Faculty role required.' });
    }

    try {
        const { projectId } = req.params;
        const { status } = req.body; // Expecting 'approved' or 'changes_requested'

        if (!['approved', 'changes_requested', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status update value.' });
        }

        // Verify that this professor is actually the assigned guide for this project
        const [project] = await db.query('SELECT * FROM projects WHERE project_id = ? AND guide_id = ?', [projectId, req.user.id]);
        
        if (project.length === 0) {
            return res.status(404).json({ message: 'Project not found or you are not authorized to review it.' });
        }

        // Update the status in MySQL
        await db.query('UPDATE projects SET status = ? WHERE project_id = ?', [status, projectId]);

        res.json({ message: `Project status successfully updated to '${status}'!` });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Failed to update project status.', error: error.message });
    }
};