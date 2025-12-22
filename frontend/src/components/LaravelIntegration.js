import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './LaravelIntegration.css';

function LaravelIntegration() {
  const [testData, setTestData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Test API connection
  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.test();
      setTestData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users from Laravel
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getUsers();
      setUsers(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically test connection on component mount
    testConnection();
  }, []);

  return (
    <div className="laravel-integration">
      <h2>Laravel API Integration</h2>
      
      {/* Test Connection Section */}
      <div className="section">
        <h3>API Connection Test</h3>
        <button onClick={testConnection} disabled={loading}>
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        
        {testData && (
          <div className="success-box">
            <p><strong>Status:</strong> {testData.status}</p>
            <p><strong>Message:</strong> {testData.message}</p>
            <p><strong>Timestamp:</strong> {testData.timestamp}</p>
          </div>
        )}
      </div>

      {/* Users Section */}
      <div className="section">
        <h3>Users from Laravel</h3>
        <button onClick={fetchUsers} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Users'}
        </button>
        
        {users.length > 0 && (
          <div className="users-list">
            <h4>Users ({users.length}):</h4>
            <ul>
              {users.map(user => (
                <li key={user.id}>
                  <strong>{user.name}</strong> - {user.email}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-box">
          <p><strong>Error:</strong> {error}</p>
          <p>Make sure Laravel backend is running on http://localhost:8000</p>
        </div>
      )}
    </div>
  );
}

export default LaravelIntegration;




