import React, { useState } from 'react';
import './Login.css';

function Login({ onLogin, onSwitchToSignUp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    // Check if user exists in localStorage
    const registeredUsername = localStorage.getItem('registeredUsername');
    const registeredPassword = localStorage.getItem('registeredPassword');

    if (!registeredUsername) {
      setError('No account found. Please sign up first.');
      return;
    }

    if (username !== registeredUsername) {
      setError('Username not found');
      return;
    }

    if (password !== registeredPassword) {
      setError('Incorrect password');
      return;
    }

    // Successful login
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('username', username);
    localStorage.setItem('userEmail', localStorage.getItem('registeredEmail') || '');
    localStorage.setItem('userFullName', localStorage.getItem('registeredFullName') || '');
    onLogin(username);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to manage your tasks</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account?</p>
          <button 
            type="button" 
            className="switch-to-signup"
            onClick={onSwitchToSignUp}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

