import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import TodoList from "./components/TodoList";
import Settings from "./components/Settings";
import { isAuthenticated, getStoredUser, clearAuthData } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("todos"); // 'todos' or 'settings'
  const [authPage, setAuthPage] = useState("login"); // 'login' or 'signup'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage("todos");
  };


  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    setCurrentPage("todos");
    setAuthPage("login");
  };

  const handleSettings = () => {
    setCurrentPage("settings");
  };

  const handleBackToTodos = () => {
    setCurrentPage("todos");
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const switchToSignUp = () => {
    setAuthPage("signup");
  };

  const switchToLogin = () => {
    setAuthPage("login");
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="App loading-screen">
        <div className="loading-spinner-large"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const renderAuthPage = () => {
    if (authPage === "signup") {
      return <SignUp onSwitchToLogin={switchToLogin} />;
    }
    return <Login onLogin={handleLogin} onSwitchToSignUp={switchToSignUp} />;
  };

  return (
    <div className="App">
      {user ? (
        currentPage === "settings" ? (
          <Settings
            user={user}
            onLogout={handleLogout}
            onBack={handleBackToTodos}
            onUserUpdate={handleUserUpdate}
          />
        ) : (
          <TodoList user={user} onSettings={handleSettings} />
        )
      ) : (
        renderAuthPage()
      )}
    </div>
  );
}

export default App;
