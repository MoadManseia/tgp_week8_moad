import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Settings.css';
import { ProfileSkeleton } from './Skeleton';
import { logout, setStoredUser } from '../services/api';
import { User } from '../types';

interface SettingsProps {
  user: User | null;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}

interface UserData {
  username: string;
  email: string;
}

const Settings: React.FC<SettingsProps> = ({ user, onLogout, onUserUpdate }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({
    username: '',
    email: '',
  });
  const [message, setMessage] = useState<string>('');
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading time for skeleton demo
    const timer = setTimeout(() => {
      if (user) {
        setUserData({
          username: user.username || '',
          email: user.email || '',
        });
      }
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    if (user) {
      const updatedUser: User = { ...user, ...userData };
      setStoredUser(updatedUser);
      onUserUpdate(updatedUser);
    }

    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      onLogout();
      navigate('/login');
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <div className="header-content">
          <h1>Settings</h1>
          <Link to="/" className="back-button">
            ← Back to Todos
          </Link>
        </div>
      </header>

      <main className="settings-main">
        <div className="settings-card">
          {isLoading ? (
            <ProfileSkeleton />
          ) : (
            <>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;

