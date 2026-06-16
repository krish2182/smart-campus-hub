// frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';

// Added onSwitchToRegister to the props destructuring here
function Login({ onLoginSuccess, onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Hit our Node.js Backend API login endpoint
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });

            // If successful, extract token and user data
            const { token, user } = response.data;

            // Save the token and user role locally in the browser
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Trigger the parent state update to redirect or change views
            onLoginSuccess(user);

        } catch (err) {
            console.error('Login component error:', err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.card}>
            <h2 style={styles.title}>Account Login</h2>
            
            {error && <div style={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Campus Email Address</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g., student@campus.com"
                        style={styles.input}
                        required 
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={styles.input}
                        required 
                    />
                </div>

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Authenticating...' : 'Sign In'}
                </button>
            </form>

            {/* PASTED DIRECTLY BELOW THE </form> TAG */}
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#718096', marginTop: '25px', marginBottom: 0, fontFamily: 'system-ui, sans-serif' }}>
                New to the platform?{' '}
                <span onClick={onSwitchToRegister} style={{ color: '#319795', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}>
                    Create an account here
                </span>
            </p>
            
        </div>
    );
}

// Basic inline styles to keep it clean and readable without massive external CSS setups
const styles = {
    card: {
        maxWidth: '400px',
        margin: '50px auto',
        padding: '30px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        backgroundColor: '#fff'
    },
    title: {
        textAlign: 'center',
        marginBottom: '25px',
        color: '#333'
    },
    inputGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#555'
    },
    input: {
        width: '100%',
        padding: '10px',
        boxSizing: 'border-box',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '16px'
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    errorAlert: {
        padding: '10px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '4px',
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '14px',
        border: '1px solid #f5c6cb'
    }
};

export default Login;