// frontend/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Register({ onSwitchToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role selection
    const [department, setDepartment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Hit our Node.js Backend Registration API
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                name,
                email,
                password,
                role,
                department
            });

            // Trigger beautiful animated success popup using the backend's response message
            Swal.fire({
                icon: 'success',
                title: 'Account Compiled! 🎉',
                text: response.data.message,
                confirmButtonColor: '#319795'
            });

            // Take the user straight to the login screen automatically
            onSwitchToLogin();

        } catch (err) {
            // Read the exact error message sent from our backend gatekeeper
            Swal.fire({
                icon: 'error',
                title: 'Registration Halted 🛑',
                text: err.response?.data?.message || 'Server connection failed.',
                confirmButtonColor: '#e53e3e'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h2 style={styles.title}>Create Portal Account</h2>
            <p style={styles.subtitle}>Join the campus capstone network.</p>
            
            <form onSubmit={handleSubmit}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Krish Madaan"
                        style={styles.input}
                        required 
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Campus Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g., krish@student.com"
                        style={styles.input}
                        required 
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Secure Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={styles.input}
                        required 
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Portal Role Profile</label>
                    <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value)}
                        style={styles.select}
                    >
                        <option value="student">Student Academic Account</option>
                        <option value="professor">Faculty Evaluation Guide</option>
                    </select>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Academic Department</label>
                    <input 
                        type="text" 
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g., Computer Science"
                        style={styles.input}
                    />
                </div>

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Compiling Credentials...' : 'Register Secure Account'}
                </button>
            </form>

            <p style={styles.switchText}>
                Already have an active profile?{' '}
                <span onClick={onSwitchToLogin} style={styles.switchLink}>
                    Sign In here
                </span>
            </p>
        </div>
    );
}

const styles = {
    card: { maxWidth: '420px', margin: '40px auto', padding: '40px 32px', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', backgroundColor: '#fff', fontFamily: 'system-ui, sans-serif' },
    title: { textAlign: 'center', margin: '0 0 4px 0', color: '#1a202c', fontWeight: '800', fontSize: '24px', letterSpacing: '-0.5px' },
    subtitle: { textAlign: 'center', margin: '0 0 30px 0', color: '#718096', fontSize: '14px' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#4a5568' },
    input: { width: '100%', padding: '12px 16px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '15px', outline: 'none', backgroundColor: '#fcfdfd' },
    select: { width: '100%', padding: '12px 16px', boxSizing: 'border-box', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '15px', outline: 'none', backgroundColor: '#fcfdfd', cursor: 'pointer' },
    button: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #319795, #2c7a7b)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 12px rgba(49,151,149,0.2)' },
    switchText: { textAlign: 'center', fontSize: '14px', color: '#718096', marginTop: '25px', marginBottom: 0 },
    switchLink: { color: '#319795', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }
};

export default Register;