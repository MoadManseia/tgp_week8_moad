import React from 'react';
import './SearchBar.css';

function SearchBar({ value, onChange, placeholder = "Search tasks..." }) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />
      {value && (
        <button 
          className="clear-search"
          onClick={handleClear}
          type="button"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;


