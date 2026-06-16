// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register'; // <-- Import the Register Component
import StudentDashboard from './components/StudentDashboard';
import ProfessorDashboard from './components/ProfessorDashboard';
import Swal from 'sweetalert2';

function App() {
  const [user, setUser] = useState(null);
  // Track auth screen mode: 'login' or 'register'
  const [authMode, setAuthMode] = useState('login'); 

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    Swal.fire({
      icon: 'success',
      title: `Welcome back, ${loggedInUser.name}!`,
      text: 'You have securely logged into the portal.',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will need to re-authenticate to view your dashboard.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#319795',
      cancelButtonColor: '#e53e3e',
      confirmButtonText: 'Yes, Sign Out'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setAuthMode('login'); // Reset back to login screen on logout
        Swal.fire({ icon: 'success', title: 'Logged Out', timer: 1500, showConfirmButton: false });
      }
    });
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.navHeader}>
        <div style={styles.brandGroup}>
          <span style={styles.logoIcon}>🎓</span>
          <h1 style={styles.logoText}>SmartCampus<span style={{ color: '#319795' }}>Hub</span></h1>
        </div>
        {user && (
          <div style={styles.userProfile}>
            <div style={styles.avatar}>{user.name.split(' ').map(n => n[0]).join('')}</div>
            <div style={styles.metaText}>
              <span style={styles.userName}>{user.name}</span>
              <span style={styles.userRole}>{user.role.toUpperCase()}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        )}
      </header>

      <main style={styles.mainWrapper}>
        {!user ? (
          // IF NO USER SESSION: Switch display between Login and Register states fluidly
          authMode === 'login' ? (
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              onSwitchToRegister={() => setAuthMode('register')} // <-- This handles the link click!
            />
          ) : (
            <Register 
              onSwitchToLogin={() => setAuthMode('login')} // <-- This handles going back!
            />
          )
        ) : user.role === 'student' ? (
          <StudentDashboard />
        ) : (
          <ProfessorDashboard />
        )}
      </main>
    </div>
  );
}

const styles = {
  appContainer: { backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", sans-serif', margin: 0, padding: 0 },
  navHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '16px 40px', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoIcon: { fontSize: '28px' },
  logoText: { margin: 0, fontSize: '22px', fontWeight: '800', color: '#1a202c', letterSpacing: '-0.5px' },
  userProfile: { display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '6px 14px', borderRadius: '30px', border: '1px solid #edf2f7' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #319795, #4fd1c5)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px' },
  metaText: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '14px', fontWeight: '700', color: '#2d3748' },
  userRole: { fontSize: '10px', fontWeight: '800', color: '#718096', letterSpacing: '0.5px' },
  logoutBtn: { padding: '6px 14px', cursor: 'pointer', borderRadius: '20px', border: 'none', background: '#edf2f7', fontWeight: '600', fontSize: '12px', color: '#4a5568', marginLeft: '8px' },
  mainWrapper: { padding: '40px 20px' }
};

export default App;