import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, isAuthenticated } from '../services/api';
import './LaravelIntegration.css';
import { User } from '../types';

type ConnectionStatus = 'checking' | 'connected' | 'error';

const LaravelIntegration: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async (): Promise<void> => {
    setStatus('checking');
    setError(null);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'OPTIONS',
      });
      
      if (response.ok || response.status === 200) {
        setStatus('connected');
        
        if (isAuthenticated()) {
          try {
            const userData = await getProfile();
            setUser(userData);
          } catch (err) {
            console.log('Not authenticated or token expired');
          }
        }
      } else {
        setStatus('error');
        setError('Backend returned an error');
      }
    } catch (err) {
      setStatus('error');
      setError('Cannot connect to Laravel backend. Make sure it\'s running on http://127.0.0.1:8000');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="laravel-integration">
      <div className="integration-card">
        <h2>🔌 API Connection Status</h2>
        
        <div className={`status-indicator ${status}`}>
          {status === 'checking' && (
            <>
              <div className="status-spinner"></div>
              <span>Checking connection...</span>
            </>
          )}
          {status === 'connected' && (
            <>
              <div className="status-dot connected"></div>
              <span>Connected to Laravel Backend</span>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="status-dot error"></div>
              <span>Connection Failed</span>
            </>
          )}
        </div>

        {error && (
          <div className="error-box">
            <p>⚠️ {error}</p>
            <p className="hint">Run: <code>cd backend && php artisan serve</code></p>
          </div>
        )}

        {status === 'connected' && (
          <div className="connection-info">
            <div className="info-item">
              <span className="label">Backend URL:</span>
              <span className="value">http://127.0.0.1:8000</span>
            </div>
            <div className="info-item">
              <span className="label">API Base:</span>
              <span className="value">/api</span>
            </div>
            <div className="info-item">
              <span className="label">Auth Status:</span>
              <span className="value">{isAuthenticated() ? '✅ Logged In' : '❌ Not Logged In'}</span>
            </div>
            {user && (
              <div className="info-item">
                <span className="label">Current User:</span>
                <span className="value">{user.username} ({user.email})</span>
              </div>
            )}
          </div>
        )}

        <div className="actions">
          <button onClick={checkConnection} className="refresh-btn">
            🔄 Refresh Status
          </button>
          {!isAuthenticated() && status === 'connected' && (
            <Link to="/login" className="login-link">
              Go to Login →
            </Link>
          )}
          {isAuthenticated() && status === 'connected' && (
            <Link to="/" className="home-link">
              Go to Todo List →
            </Link>
          )}
        </div>

        <div className="api-endpoints">
          <h3>Available API Endpoints</h3>
          <ul>
            <li><code>POST /api/register</code> - Register new user</li>
            <li><code>POST /api/login</code> - User login</li>
            <li><code>POST /api/logout</code> - User logout</li>
            <li><code>GET /api/user</code> - Get current user</li>
            <li><code>GET /api/tasks</code> - Get all tasks</li>
            <li><code>POST /api/tasks</code> - Create task</li>
            <li><code>PUT /api/tasks/:id</code> - Update task</li>
            <li><code>DELETE /api/tasks/:id</code> - Delete task</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LaravelIntegration;

