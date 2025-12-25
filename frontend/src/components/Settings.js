import React, { useState, useEffect } from 'react';
import './Settings.css';
import { logout, setStoredUser } from '../services/api';

function Settings({ user, onLogout, onBack, onUserUpdate }) {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
  });
  const [message, setMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Load user data from props
    if (user) {
      setUserData({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Update stored user data
    const updatedUser = { ...user, ...userData };
    setStoredUser(updatedUser);
    
    // Notify parent component
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }

    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      onLogout();
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <div className="header-content">
          <h1>Settings</h1>
          <button onClick={onBack} className="back-button">
            ← Back to Todos
          </button>
        </div>
      </header>

      <main className="settings-main">
        <div className="settings-card">
          <h2>User Information</h2>
          <p className="settings-subtitle">Manage your account details</p>

          <form onSubmit={handleSave} className="settings-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={userData.username}
                onChange={handleChange}
                placeholder="Enter username"
                disabled
              />
              <small className="field-hint">Username cannot be changed</small>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled
              />
              <small className="field-hint">Email cannot be changed</small>
            </div>

            {message && (
              <div className={`message ${message.includes('success') ? 'success' : ''}`}>
                {message}
              </div>
            )}
          </form>

          <div className="logout-section">
            <h3>Account Actions</h3>
            <button 
              onClick={handleLogout} 
              className="logout-button"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
