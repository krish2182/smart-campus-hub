// backend/seed.js
const db = require('./db');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

async function seedDatabase() {
    console.log('🌱 Initializing automated database seeding routine...');
    
    try {
        // 1. Clear existing data to prevent duplicate email crashes
        // We disable foreign key checks temporarily so we can clear tables cleanly
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('TRUNCATE TABLE project_members');
        await db.query('TRUNCATE TABLE projects');
        await db.query('TRUNCATE TABLE users');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🧼 Existing database tables cleared successfully.');

        // Pre-generate a unified safe password hash for all mock accounts to speed up execution
        const salt = await bcrypt.genSalt(10);
        const defaultPasswordHash = await bcrypt.hash('password123', salt);
        
        const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'];

        // ==========================================
        // 2. SEED 20 PROFESSORS
        // ==========================================
        console.log('🧑‍🏫 Generating 20 faculty profiles...');
        const professorIds = [];

        for (let i = 1; i <= 20; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();
            const name = `Dr. ${firstName} ${lastName}`;
            const email = `prof.${firstName.toLowerCase()}@campus.com`;
            const department = departments[Math.floor(Math.random() * departments.length)];

            const [result] = await db.query(
                'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
                [name, email, defaultPasswordHash, 'professor', department]
            );
            professorIds.push(result.insertId);
        }

        // ==========================================
        // 3. SEED 100 STUDENTS
        // ==========================================
        console.log('👨‍💻 Generating 100 student profiles...');
        const studentIds = [];

        for (let i = 1; i <= 100; i++) {
            const name = faker.person.fullName();
            // Generate clean unique emails
            const email = `${name.toLowerCase().replace(/[^a-z]/g, '')}${i}@student.com`;
            const department = departments[Math.floor(Math.random() * departments.length)];

            const [result] = await db.query(
                'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
                [name, email, defaultPasswordHash, 'student', department]
            );
            studentIds.push(result.insertId);
        }

        // ==========================================
        // 4. OPTIONAL: SEED 30 MOCK PROJECTS
        // ==========================================
        console.log('📁 Populating 30 mock project submission records...');
        const projectTemplates = [
            { title: 'AI-Driven Code Optimizer', tech: 'Python, FastAPI, React' },
            { title: 'Smart Parking IoT System', tech: 'Node.js, MySQL, Arduino' },
            { title: 'Blockchain Academic Verifier', tech: 'Solidity, React, Node.js' },
            { title: 'Cloud-Native Deployment Pipeline', tech: 'Docker, AWS, Express' },
            { title: 'Healthcare Inventory Engine', tech: 'React, Node.js, MySQL' }
        ];

        for (let i = 0; i < 30; i++) {
            const template = projectTemplates[i % projectTemplates.length];
            const title = `${template.title} V${Math.floor(i/5) + 1}`;
            const description = faker.lorem.paragraph();
            const status = ['pending', 'approved', 'changes_requested'][Math.floor(Math.random() * 3)];
            const guideId = professorIds[Math.floor(Math.random() * professorIds.length)];
            const studentId = studentIds[i]; // Assign distinct student creators

            // Insert Project
            const [projResult] = await db.query(
                'INSERT INTO projects (title, description, tech_stack, status, academic_year, guide_id) VALUES (?, ?, ?, ?, ?, ?)',
                [title, description, template.tech, status, 2026, guideId]
            );

            // Map creator to the project members bridge table
            await db.query(
                'INSERT INTO project_members (project_id, student_id) VALUES (?, ?)',
                [projResult.insertId, studentId]
            );
        }

        console.log('✅ Seeding absolute! 20 Professors, 100 Students, and 30 initial project structures live in MySQL.');
    } catch (error) {
        console.error('❌ Database seeding execution failed:', error);
    } finally {
        // Exit process cleanly
        process.exit();
    }
}

// Execute the function script
seedDatabase();