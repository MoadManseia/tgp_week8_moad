import React, { useState, useEffect, useCallback } from 'react';
import './TodoList.css';
import SearchBar from './SearchBar';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';

function TodoList({ user, onSettings }) {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load todos from API on mount
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const tasks = await getTasks();
      // Map backend task format to frontend format
      const mappedTasks = tasks.map(task => ({
        id: task.id,
        text: task.title,
        description: task.description,
        completed: task.is_completed,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      }));
      setTodos(mappedTasks);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Load tasks error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const task = await createTask({
        title: newTask.trim(),
        is_completed: false,
      });

      const newTodo = {
        id: task.id,
        text: task.title,
        description: task.description,
        completed: task.is_completed,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      };

      setTodos([newTodo, ...todos]);
      setNewTask('');
    } catch (err) {
      setError('Failed to add task. Please try again.');
      console.error('Add task error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic update
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));

    try {
      await updateTask(id, { is_completed: !todo.completed });
    } catch (err) {
      // Revert on error
      setTodos(todos.map(t =>
        t.id === id ? { ...t, completed: todo.completed } : t
      ));
      setError('Failed to update task. Please try again.');
      console.error('Toggle complete error:', err);
    }
  };

  const deleteTaskHandler = async (id) => {
    // Optimistic update
    const todoToDelete = todos.find(t => t.id === id);
    setTodos(todos.filter(t => t.id !== id));

    try {
      await deleteTask(id);
    } catch (err) {
      // Revert on error
      setTodos([...todos, todoToDelete].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ));
      setError('Failed to delete task. Please try again.');
      console.error('Delete task error:', err);
    }
  };

  const editTask = async (id, newText) => {
    if (!newText.trim()) return;

    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic update
    setTodos(todos.map(t =>
      t.id === id ? { ...t, text: newText.trim() } : t
    ));

    try {
      await updateTask(id, { title: newText.trim() });
    } catch (err) {
      // Revert on error
      setTodos(todos.map(t =>
        t.id === id ? { ...t, text: todo.text } : t
      ));
      setError('Failed to update task. Please try again.');
      console.error('Edit task error:', err);
    }
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter(t => t.completed);
    
    // Optimistic update
    setTodos(todos.filter(t => !t.completed));

    try {
      // Delete all completed tasks
      await Promise.all(completedTodos.map(t => deleteTask(t.id)));
    } catch (err) {
      // Revert on error - reload all tasks
      await loadTasks();
      setError('Failed to clear completed tasks. Please try again.');
      console.error('Clear completed error:', err);
    }
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

  if (isLoading) {
    return (
      <div className="todo-container">
        <header className="todo-header">
          <div className="header-content">
            <h1>My Todo List</h1>
            <div className="user-info">
              <span className="username">Welcome, {user?.username || 'User'}!</span>
            </div>
          </div>
        </header>
        <main className="todo-main">
          <div className="todo-card loading-card">
            <div className="loading-spinner"></div>
            <p>Loading your tasks...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="todo-container">
      <header className="todo-header">
        <div className="header-content">
          <h1>My Todo List</h1>
          <div className="user-info">
            <span className="username">Welcome, {user?.username || 'User'}!</span>
            <button onClick={onSettings} className="settings-button">
              ⚙️ Settings
            </button>
          </div>
        </div>
      </header>

      <main className="todo-main">
        <div className="todo-card">
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => setError('')} className="dismiss-error">×</button>
            </div>
          )}

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
              disabled={isSubmitting}
            />
            <button type="submit" className="add-button" disabled={isSubmitting || !newTask.trim()}>
              {isSubmitting ? 'Adding...' : 'Add Task'}
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
                ) : filter === 'completed' ? (
                  <p>No completed tasks yet</p>
                ) : filter === 'active' ? (
                  <p>All tasks are completed! 🎉</p>
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
                  onDelete={deleteTaskHandler}
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
      if (editText.trim() && editText.trim() !== todo.text) {
        onEdit(todo.id, editText);
      } else {
        setEditText(todo.text);
      }
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
