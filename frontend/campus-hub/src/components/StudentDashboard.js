// frontend/src/components/StudentDashboard.js
import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function StudentDashboard() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [techStack, setTechStack] = useState('');
    const [academicYear, setAcademicYear] = useState('2026');
    const [guideId, setGuideId] = useState(''); 
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const payload = { title, description, tech_stack: techStack, academic_year: academicYear, guide_id: parseInt(guideId) };

            await axios.post('https://smart-campus-backend.onrender.com/api/projects/create', payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Clean, gorgeous popup confirmation notification
            Swal.fire({
                icon: 'success',
                title: 'Proposal Dispatched! 🚀',
                text: 'Your capstone project configuration has been routed to your professor.',
                confirmButtonColor: '#319795'
            });

            setTitle('');
            setDescription('');
            setTechStack('');
            setGuideId('');

        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Submission Halted',
                text: err.response?.data?.message || 'Check database connectivity credentials.',
                confirmButtonColor: '#e53e3e'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formHeader}>
                <h2 style={styles.heading}>Propose New Capstone Project</h2>
                <p style={styles.subtext}>Submit your software engineering draft configuration directly to faculty nodes.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Project Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Cross-Platform AI Diagnostics Engine"
                        style={styles.input}
                        required 
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Abstract / Functional Scope</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe architectural challenges, endpoints, database scaling plans..."
                        style={{ ...styles.input, height: '110px', resize: 'none' }}
                        required
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Target Technology Stack</label>
                    <input 
                        type="text" 
                        value={techStack} 
                        onChange={(e) => setTechStack(e.target.value)}
                        placeholder="e.g., Node.js, Express, MySQL, React"
                        style={styles.input}
                        required
                    />
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ ...styles.inputGroup, flex: 1 }}>
                        <label style={styles.label}>Academic Execution Year</label>
                        <input type="number" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={styles.input} required />
                    </div>
                    <div style={{ ...styles.inputGroup, flex: 1 }}>
                        <label style={styles.label}>Faculty Guide Identifier (ID)</label>
                        <input type="number" value={guideId} onChange={(e) => setGuideId(e.target.value)} placeholder="e.g., 5" style={styles.input} required />
                    </div>
                </div>

                <button type="submit" disabled={loading} style={styles.submitBtn}>
                    {loading ? 'Compiling Parameters...' : 'Deploy Proposal Package'}
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: { maxWidth: '680px', margin: '20px auto', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01)', overflow: 'hidden' },
    formHeader: { background: 'linear-gradient(135deg, #1a202c, #2d3748)', padding: '30px 32px', color: '#fff' },
    heading: { margin: '0 0 6px 0', fontSize: '22px', fontWeight: '700' },
    subtext: { color: '#a0aec0', fontSize: '14px', margin: 0 },
    inputGroup: { marginBottom: '22px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#4a5568', letterSpacing: '0.3px' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e0', boxSizing: 'border-box', fontSize: '15px', outline: 'none', transition: 'all 0.2s', backgroundColor: '#fcfdfd' },
    submitBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #319795, #2c7a7b)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(49,151,149,0.3)' }
};

export default StudentDashboard;