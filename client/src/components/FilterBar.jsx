import { useState } from 'react';
import './FilterBar.css';

export default function FilterBar({ filters, onFilterChange }) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput });
  };

  const handleStatusChange = (e) => {
    onFilterChange({ ...filters, status: e.target.value || undefined });
  };

  const handlePriorityChange = (e) => {
    onFilterChange({ ...filters, priority: e.target.value || undefined });
  };

  const clearFilters = () => {
    setSearchInput('');
    onFilterChange({});
  };

  return (
    <div className="filter-bar">
      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          type="text"
          placeholder="Search ideas..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>

      <div className="filter-selects">
        <select value={filters.status || ''} onChange={handleStatusChange}>
          <option value="">All Statuses</option>
          <option value="idea">Idea</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>

        <select value={filters.priority || ''} onChange={handlePriorityChange}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <button type="button" onClick={clearFilters} className="clear-button">
          Clear
        </button>
      </div>
    </div>
  );
}
