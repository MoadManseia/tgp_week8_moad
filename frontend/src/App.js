import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import TodoList from "./components/TodoList";
import Settings from "./components/Settings";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [currentPage, setCurrentPage] = useState("todos"); // 'todos' or 'settings'
  const [authPage, setAuthPage] = useState("login"); // 'login' or 'signup'

  useEffect(() => {
    // Check if user is already logged in
    const authStatus = localStorage.getItem("isAuthenticated");
    const savedUsername = localStorage.getItem("username");

    if (authStatus === "true" && savedUsername) {
      setIsAuthenticated(true);
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUsername(user);
    setCurrentPage("todos");
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("userBio");
    setIsAuthenticated(false);
    setUsername("");
    setCurrentPage("todos");
    setAuthPage("login");
  };

  const handleSettings = () => {
    setCurrentPage("settings");
  };

  const handleBackToTodos = () => {
    setCurrentPage("todos");
    // Refresh username in case it was changed
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  };

  const switchToSignUp = () => {
    setAuthPage("signup");
  };

  const switchToLogin = () => {
    setAuthPage("login");
  };

  const renderAuthPage = () => {
    if (authPage === "signup") {
      return <SignUp onSwitchToLogin={switchToLogin} />;
    }
    return <Login onLogin={handleLogin} onSwitchToSignUp={switchToSignUp} />;
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        currentPage === "settings" ? (
          <Settings
            username={username}
            onLogout={handleLogout}
            onBack={handleBackToTodos}
          />
        ) : (
          <TodoList username={username} onSettings={handleSettings} />
        )
      ) : (
        renderAuthPage()
      )}
    </div>
  );
}

export default App;
