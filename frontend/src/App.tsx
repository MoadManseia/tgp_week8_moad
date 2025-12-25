import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import TodoList from "./components/TodoList";
import Settings from "./components/Settings";
import LaravelIntegration from "./components/LaravelIntegration";
import { isAuthenticated, getStoredUser, clearAuthData } from "./services/api";
import { User } from "./types";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface PublicRouteProps {
  children: React.ReactNode;
}

// Protected Route component - redirects to login if not authenticated
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Public Route component - redirects to home if already authenticated
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isAuthenticated()) {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User): void => {
    setUser(userData);
  };

  const handleLogout = (): void => {
    clearAuthData();
    setUser(null);
  };

  const handleUserUpdate = (updatedUser: User): void => {
    setUser(updatedUser);
  };

  if (isLoading) {
    return (
      <div className="App loading-screen">
        <div className="app-skeleton">
          <div className="app-skeleton-header">
            <div className="skeleton-shimmer" style={{ width: '200px', height: '40px', borderRadius: '8px' }} />
            <div className="skeleton-shimmer" style={{ width: '150px', height: '36px', borderRadius: '8px' }} />
          </div>
          <div className="app-skeleton-content">
            <div className="skeleton-shimmer" style={{ width: '100%', height: '48px', borderRadius: '12px', marginBottom: '20px' }} />
            <div className="skeleton-shimmer" style={{ width: '100%', height: '48px', borderRadius: '12px', marginBottom: '30px' }} />
            <div className="skeleton-shimmer" style={{ width: '100%', height: '60px', borderRadius: '12px', marginBottom: '12px' }} />
            <div className="skeleton-shimmer" style={{ width: '100%', height: '60px', borderRadius: '12px', marginBottom: '12px' }} />
            <div className="skeleton-shimmer" style={{ width: '100%', height: '60px', borderRadius: '12px' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login onLogin={handleLogin} />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />
          <Route
            path="/status"
            element={<LaravelIntegration />}
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TodoList user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings
                  user={user}
                  onLogout={handleLogout}
                  onUserUpdate={handleUserUpdate}
                />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

