import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

// Basic skeleton element
export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = ''
}) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};

// Skeleton for a single todo item
export const TodoItemSkeleton: React.FC = () => {
  return (
    <div className="todo-item-skeleton">
      <div className="skeleton checkbox-skeleton" />
      <div className="skeleton-content">
        <Skeleton width="70%" height="18px" />
      </div>
      <div className="skeleton-actions">
        <div className="skeleton action-skeleton" />
        <div className="skeleton action-skeleton" />
      </div>
    </div>
  );
};

// Skeleton for the todo list
export const TodoListSkeleton: React.FC = () => {
  return (
    <div className="todo-list-skeleton">
      {/* Search bar skeleton */}
      <div className="search-skeleton">
        <Skeleton height="48px" borderRadius="12px" />
      </div>

      {/* Add task form skeleton */}
      <div className="add-task-skeleton">
        <Skeleton width="75%" height="48px" borderRadius="12px" />
        <Skeleton width="23%" height="48px" borderRadius="12px" />
      </div>

      {/* Filter buttons skeleton */}
      <div className="filter-skeleton">
        <Skeleton width="80px" height="40px" borderRadius="8px" />
        <Skeleton width="80px" height="40px" borderRadius="8px" />
        <Skeleton width="100px" height="40px" borderRadius="8px" />
      </div>

      {/* Todo items skeleton */}
      <div className="todos-skeleton">
        <TodoItemSkeleton />
        <TodoItemSkeleton />
        <TodoItemSkeleton />
        <TodoItemSkeleton />
        <TodoItemSkeleton />
      </div>
    </div>
  );
};

// Skeleton for user profile card
export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="profile-skeleton">
      <div className="profile-header-skeleton">
        <Skeleton width="60%" height="32px" borderRadius="6px" />
        <Skeleton width="40%" height="16px" borderRadius="4px" />
      </div>
      
      <div className="profile-form-skeleton">
        <div className="field-skeleton">
          <Skeleton width="80px" height="14px" borderRadius="4px" />
          <Skeleton height="48px" borderRadius="10px" />
        </div>
        <div className="field-skeleton">
          <Skeleton width="60px" height="14px" borderRadius="4px" />
          <Skeleton height="48px" borderRadius="10px" />
        </div>
      </div>

      <div className="logout-skeleton">
        <Skeleton width="120px" height="20px" borderRadius="4px" />
        <Skeleton height="48px" borderRadius="12px" />
      </div>
    </div>
  );
};

// Skeleton for login/signup forms
export const AuthFormSkeleton: React.FC = () => {
  return (
    <div className="auth-form-skeleton">
      <Skeleton width="60%" height="36px" borderRadius="6px" className="center" />
      <Skeleton width="80%" height="16px" borderRadius="4px" className="center" />
      
      <div className="auth-fields-skeleton">
        <div className="field-skeleton">
          <Skeleton width="100px" height="14px" borderRadius="4px" />
          <Skeleton height="48px" borderRadius="10px" />
        </div>
        <div className="field-skeleton">
          <Skeleton width="80px" height="14px" borderRadius="4px" />
          <Skeleton height="48px" borderRadius="10px" />
        </div>
      </div>

      <Skeleton height="48px" borderRadius="10px" />
    </div>
  );
};

export default Skeleton;

