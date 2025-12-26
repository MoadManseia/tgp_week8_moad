import React, { useState, useEffect, useCallback, useRef, FormEvent, KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import './TodoList.css';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import { TodoListSkeleton } from './Skeleton';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import { User, Todo } from '../types';

interface TodoListProps {
  user: User | null;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
}

const TodoList: React.FC<TodoListProps> = ({ user }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [showDescription, setShowDescription] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [deletingTaskIds, setDeletingTaskIds] = useState<Set<number>>(new Set());
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<number>>(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [perPage] = useState<number>(5);

  // Stable load tasks function - doesn't depend on search/filter to avoid re-renders
  const loadTasks = useCallback(async (
    page: number, 
    search: string, 
    filterValue: 'all' | 'active' | 'completed'
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError('');
      
      // Add minimum delay to show skeleton (1.5 seconds minimum)
      const [paginationResult] = await Promise.all([
        getTasks({ 
          page, 
          per_page: perPage,
          search: search.trim() || undefined,
          filter: filterValue
        }),
        new Promise<void>(resolve => setTimeout(resolve, 1500))
      ]);
      
      const mappedTasks: Todo[] = paginationResult.data.map(task => ({
        id: task.id,
        text: task.title,
        description: task.description,
        completed: task.is_completed,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      }));
      
      setTodos(mappedTasks);
      setLastPage(paginationResult.last_page);
      setTotalTasks(paginationResult.total);
      
      // Debug logging
      console.log('Pagination data:', {
        requested_page: page,
        current_page: paginationResult.current_page,
        last_page: paginationResult.last_page,
        total: paginationResult.total,
        per_page: paginationResult.per_page,
        data_count: paginationResult.data.length,
        search: search,
        filter: filterValue
      });
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Load tasks error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [perPage]);

  // Track previous search/filter to detect changes and reset page
  const prevSearchRef = useRef(searchQuery);
  const prevFilterRef = useRef(filter);
  const isFirstMount = useRef(true);

  // Single effect to handle all task loading
  useEffect(() => {
    // Skip the first mount - we'll load in the next effect
    if (isFirstMount.current) {
      isFirstMount.current = false;
      loadTasks(currentPage, searchQuery, filter);
      return;
    }

    const searchChanged = prevSearchRef.current !== searchQuery;
    const filterChanged = prevFilterRef.current !== filter;
    
    // Update refs
    prevSearchRef.current = searchQuery;
    prevFilterRef.current = filter;
    
    // If search or filter changed, reset to page 1 with debounce for search
    if (searchChanged || filterChanged) {
      const timeoutId = setTimeout(() => {
        if (currentPage === 1) {
          // Already on page 1, just reload
          loadTasks(1, searchQuery, filter);
        } else {
          // Reset to page 1 (this will trigger another effect run)
          setCurrentPage(1);
        }
      }, searchChanged ? 500 : 0);
      
      return () => clearTimeout(timeoutId);
    }
    
    // Page changed, load the new page
    loadTasks(currentPage, searchQuery, filter);
  }, [currentPage, searchQuery, filter, loadTasks]);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addTask = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!newTask.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setIsAddingTask(true);
    setError('');
    const taskText = newTask.trim();
    const taskDescription = newDescription.trim();
    setNewTask('');
    setNewDescription('');
    setShowDescription(false);

    try {
      // Add minimum delay to show skeleton
      const [task] = await Promise.all([
        createTask({
          title: taskText,
          description: taskDescription || undefined,
          is_completed: false,
        }),
        new Promise<void>(resolve => setTimeout(resolve, 800))
      ]);

      // Always reload to ensure correct pagination
      // New tasks always appear on page 1, so reload page 1
      if (currentPage === 1) {
        // Reload current page to update pagination metadata
        await loadTasks(1, searchQuery, filter);
      } else {
        // Switch to page 1 to show the new task
        setCurrentPage(1);
      }
    } catch (err) {
      setNewTask(taskText); // Restore task text on error
      setNewDescription(taskDescription); // Restore description on error
      setError('Failed to add task. Please try again.');
      console.error('Add task error:', err);
    } finally {
      setIsSubmitting(false);
      setIsAddingTask(false);
    }
  };

  const toggleComplete = async (id: number): Promise<void> => {
    const todo = todos.find(t => t.id === id);
    if (!todo || updatingTaskIds.has(id)) return;

    setUpdatingTaskIds(prev => new Set(prev).add(id));
    setTodos(todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));

    try {
      await updateTask(id, { is_completed: !todo.completed });
    } catch (err) {
      setTodos(todos.map(t =>
        t.id === id ? { ...t, completed: todo.completed } : t
      ));
      setError('Failed to update task. Please try again.');
      console.error('Toggle complete error:', err);
    } finally {
      setUpdatingTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const deleteTaskHandler = async (id: number): Promise<void> => {
    const todoToDelete = todos.find(t => t.id === id);
    if (!todoToDelete || deletingTaskIds.has(id)) return;
    
    // Add to deleting set to show skeleton
    setDeletingTaskIds(prev => new Set(prev).add(id));

    try {
      // Add minimum delay to show skeleton
      await Promise.all([
        deleteTask(id),
        new Promise<void>(resolve => setTimeout(resolve, 600))
      ]);
      
      const remainingTasks = todos.filter(t => t.id !== id);
      setTodos(remainingTasks);
      setTotalTasks(prev => prev - 1);
      
      // If current page becomes empty and not on first page, go to previous page
      if (remainingTasks.length === 0 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        // Reload current page to ensure correct pagination
        await loadTasks(currentPage, searchQuery, filter);
      }
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Delete task error:', err);
    } finally {
      setDeletingTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const editTask = async (id: number, newText: string): Promise<void> => {
    if (!newText.trim()) return;

    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    setTodos(todos.map(t =>
      t.id === id ? { ...t, text: newText.trim() } : t
    ));

    try {
      await updateTask(id, { title: newText.trim() });
    } catch (err) {
      setTodos(todos.map(t =>
        t.id === id ? { ...t, text: todo.text } : t
      ));
      setError('Failed to update task. Please try again.');
      console.error('Edit task error:', err);
    }
  };

  const clearCompleted = async (): Promise<void> => {
    const completedTodos = todos.filter(t => t.completed);
    const completedCount = completedTodos.length;
    
    setTodos(todos.filter(t => !t.completed));

    try {
      await Promise.all(completedTodos.map(t => deleteTask(t.id)));
      setTotalTasks(prev => prev - completedCount);
      
      // Reload current page or go to first page if current page becomes empty
      if (todos.length - completedCount === 0 && currentPage > 1) {
        setCurrentPage(1);
      } else {
        await loadTasks(currentPage, searchQuery, filter);
      }
    } catch (err) {
      await loadTasks(currentPage, searchQuery, filter);
      setError('Failed to clear completed tasks. Please try again.');
      console.error('Clear completed error:', err);
    }
  };

  // Note: Filtering and searching are now done server-side
  // The todos array already contains filtered results from the API
  
  // For display purposes, we still calculate counts from current page
  // (Note: These are page-specific counts, not total counts)
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
              <Link to="/settings" className="settings-button">
                ⚙️ Settings
              </Link>
            </div>
          </div>
        </header>
        <main className="todo-main">
          <div className="todo-card">
            <TodoListSkeleton />
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
            <Link to="/settings" className="settings-button">
              ⚙️ Settings
            </Link>
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
            <div className="task-inputs">
              <div className="task-input-row">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task..."
                  className="task-input"
                  disabled={isSubmitting}
                />
                <button 
                  type="button" 
                  className={`description-toggle ${showDescription ? 'active' : ''}`}
                  onClick={() => setShowDescription(!showDescription)}
                  disabled={isSubmitting}
                  title={showDescription ? 'Hide description' : 'Add description'}
                >
                  {showDescription ? '−' : '+'}
                </button>
              </div>
              
              {showDescription && (
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Add description (optional)..."
                  className="description-input"
                  disabled={isSubmitting}
                  rows={2}
                />
              )}
            </div>
            <button type="submit" className="add-button" disabled={isSubmitting || !newTask.trim()}>
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </form>

          <div className="filter-buttons">
            <button
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'active' : ''}
            >
              All ({filter === 'all' ? totalTasks : todos.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={filter === 'active' ? 'active' : ''}
            >
              Active ({filter === 'active' ? totalTasks : activeCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={filter === 'completed' ? 'active' : ''}
            >
              Completed ({filter === 'completed' ? totalTasks : completedCount})
            </button>
          </div>

          <div className="todos-list">
            {/* Show skeleton when adding a new task */}
            {isAddingTask && (
              <div className="todo-item adding">
                <div className="todo-item-skeleton-inline">
                  <div className="skeleton-checkbox"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-actions">
                    <div className="skeleton-btn"></div>
                    <div className="skeleton-btn"></div>
                  </div>
                </div>
              </div>
            )}
            
            {todos.length === 0 && !isAddingTask ? (
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
              todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleComplete}
                  onDelete={deleteTaskHandler}
                  onEdit={editTask}
                  isDeleting={deletingTaskIds.has(todo.id)}
                  isUpdating={updatingTaskIds.has(todo.id)}
                />
              ))
            )}
          </div>

          {filter === 'completed' && completedCount > 0 && (
            <button onClick={clearCompleted} className="clear-button">
              Clear Completed ({completedCount})
            </button>
          )}

          {/* Pagination - show when there are multiple pages (works with filters/search) */}
          {totalTasks > perPage && (
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              total={totalTasks}
              perPage={perPage}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </main>
    </div>
  );
};

const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  onToggle, 
  onDelete, 
  onEdit,
  isDeleting = false,
  isUpdating = false 
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(todo.text);

  const handleEdit = (): void => {
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

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  // Show skeleton when deleting
  if (isDeleting) {
    return (
      <div className="todo-item deleting">
        <div className="todo-item-skeleton-inline">
          <div className="skeleton-checkbox"></div>
          <div className="skeleton-text deleting-pulse"></div>
          <div className="skeleton-actions">
            <div className="skeleton-btn"></div>
            <div className="skeleton-btn"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${isUpdating ? 'updating' : ''} ${todo.description ? 'has-description' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className={`todo-checkbox ${isUpdating ? 'loading' : ''}`}
        disabled={isUpdating}
      />
      
      <div className="todo-content">
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
          <>
            <span
              className="todo-text"
              onDoubleClick={handleEdit}
            >
              {todo.text}
            </span>
            {todo.description && (
              <span className="todo-description">
                {todo.description}
              </span>
            )}
          </>
        )}
      </div>
      
      <div className="todo-actions">
        <button
          onClick={handleEdit}
          className="edit-button"
          title="Edit task"
          disabled={isUpdating}
        >
          {isEditing ? '✓' : '✎'}
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="delete-button"
          title="Delete task"
          disabled={isUpdating}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default TodoList;

