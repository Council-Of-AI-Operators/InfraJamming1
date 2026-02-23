import IdeaCard from './IdeaCard';
import './IdeaList.css';

export default function IdeaList({ ideas, loading, error, onEdit, onDelete }) {
  if (loading) {
    return <div className="idea-list-message">Loading ideas...</div>;
  }

  if (error) {
    return <div className="idea-list-message error">Error: {error}</div>;
  }

  if (ideas.length === 0) {
    return (
      <div className="idea-list-message">
        No ideas yet. Create your first actionable idea!
      </div>
    );
  }

  return (
    <div className="idea-list">
      {ideas.map(idea => (
        <IdeaCard
          key={idea.id}
          idea={idea}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
