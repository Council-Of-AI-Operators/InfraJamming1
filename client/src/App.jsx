import { useState, useEffect, useCallback } from 'react';
import FilterBar from './components/FilterBar';
import IdeaList from './components/IdeaList';
import IdeaForm from './components/IdeaForm';
import { fetchIdeas, createIdea, updateIdea, deleteIdea } from './api/ideas';
import './App.css';

export default function App() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);

  const loadIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIdeas(filters);
      setIdeas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCreateClick = () => {
    setEditingIdea(null);
    setShowForm(true);
  };

  const handleEditClick = (idea) => {
    setEditingIdea(idea);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingIdea(null);
  };

  const handleFormSubmit = async (formData) => {
    if (editingIdea) {
      await updateIdea(editingIdea.id, formData);
    } else {
      await createIdea(formData);
    }
    setShowForm(false);
    setEditingIdea(null);
    loadIdeas();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      try {
        await deleteIdea(id);
        loadIdeas();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Actionable Ideas</h1>
        <button onClick={handleCreateClick} className="new-idea-button">
          + New Idea
        </button>
      </header>

      <main className="app-main">
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        <IdeaList
          ideas={ideas}
          loading={loading}
          error={error}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      </main>

      {showForm && (
        <IdeaForm
          idea={editingIdea}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
