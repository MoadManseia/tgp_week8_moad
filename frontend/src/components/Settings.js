import React, { useState, useEffect } from 'react';
import './Settings.css';

function Settings({ username, onLogout, onBack }) {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    fullName: '',
    bio: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load user data from localStorage
    const savedUsername = localStorage.getItem('username') || username || '';
    const savedEmail = localStorage.getItem('userEmail') || '';
    const savedFullName = localStorage.getItem('userFullName') || '';
    const savedBio = localStorage.getItem('userBio') || '';

    setUserData({
      username: savedUsername,
      email: savedEmail,
      fullName: savedFullName,
      bio: savedBio
    });
  }, [username]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem('username', userData.username);
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userFullName', userData.fullName);
    localStorage.setItem('userBio', userData.bio);

    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
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
                required
              />
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={userData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={userData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows="4"
              />
            </div>

            {message && (
              <div className={`message ${message.includes('success') ? 'success' : ''}`}>
                {message}
              </div>
            )}

            <div className="settings-actions">
              <button type="submit" className="save-button">
                Save Changes
              </button>
            </div>
          </form>

          <div className="logout-section">
            <h3>Account Actions</h3>
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;

