import React, { useState, useEffect } from 'react';
import './TodoList.css';
import SearchBar from './SearchBar';

function TodoList({ username, onSettings }) {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [searchQuery, setSearchQuery] = useState('');

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    } else {
      // Initialize with some fake data
      const fakeTodos = [
        { id: 1, text: 'Complete project documentation', completed: false, createdAt: new Date().toISOString() },
        { id: 2, text: 'Review code changes', completed: true, createdAt: new Date().toISOString() },
        { id: 3, text: 'Prepare presentation slides', completed: false, createdAt: new Date().toISOString() },
      ];
      setTodos(fakeTodos);
      localStorage.setItem('todos', JSON.stringify(fakeTodos));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      const newTodo = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTodos([...todos, newTodo]);
      setNewTask('');
    }
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTask = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const editTask = (id, newText) => {
    if (newText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, text: newText.trim() } : todo
      ));
    }
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    // First apply status filter
    if (filter === 'active' && todo.completed) return false;
    if (filter === 'completed' && !todo.completed) return false;
    
    // Then apply search filter
    if (searchQuery.trim()) {
      return todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="todo-container">
      <header className="todo-header">
        <div className="header-content">
          <h1>My Todo List</h1>
          <div className="user-info">
            <span className="username">Welcome, {username}!</span>
            <button onClick={onSettings} className="settings-button">
              ⚙️ Settings
            </button>
          </div>
        </div>
      </header>

      <main className="todo-main">
        <div className="todo-card">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="Search tasks..."
          />

          <form onSubmit={addTask} className="add-task-form">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="task-input"
            />
            <button type="submit" className="add-button">
              Add Task
            </button>
          </form>

          <div className="filter-buttons">
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'active' : ''}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={filter === 'active' ? 'active' : ''}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={filter === 'completed' ? 'active' : ''}
            >
              Completed ({completedCount})
            </button>
          </div>

          <div className="todos-list">
            {filteredTodos.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? (
                  <p>No tasks matching "{searchQuery}"</p>
                ) : (
                  <p>No tasks found. Add a new task to get started!</p>
                )}
              </div>
            ) : (
              filteredTodos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleComplete}
                  onDelete={deleteTask}
                  onEdit={editTask}
                />
              ))
            )}
          </div>

          {completedCount > 0 && (
            <button onClick={clearCompleted} className="clear-button">
              Clear Completed ({completedCount})
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEdit = () => {
    if (isEditing) {
      onEdit(todo.id, editText);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="todo-checkbox"
      />
      
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={handleKeyPress}
          className="edit-input"
          autoFocus
        />
      ) : (
        <span
          className="todo-text"
          onDoubleClick={handleEdit}
        >
          {todo.text}
        </span>
      )}
      
      <div className="todo-actions">
        <button
          onClick={handleEdit}
          className="edit-button"
          title="Edit task"
        >
          {isEditing ? '✓' : '✎'}
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="delete-button"
          title="Delete task"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default TodoList;

