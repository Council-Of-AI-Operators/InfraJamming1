import './IdeaCard.css';

export default function IdeaCard({ idea, onEdit, onDelete }) {
  const priorityClass = `priority-${idea.priority}`;
  const statusClass = `status-${idea.status}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className={`idea-card ${priorityClass}`}>
      <div className="idea-header">
        <h3 className="idea-title">{idea.title}</h3>
        <div className="idea-actions">
          <button onClick={() => onEdit(idea)} className="edit-button">Edit</button>
          <button onClick={() => onDelete(idea.id)} className="delete-button">Delete</button>
        </div>
      </div>

      {idea.description && (
        <p className="idea-description">{idea.description}</p>
      )}

      <div className="idea-meta">
        <span className={`idea-status ${statusClass}`}>{idea.status}</span>
        <span className="idea-priority">{idea.priority} priority</span>
        {idea.due_date && (
          <span className="idea-due-date">Due: {formatDate(idea.due_date)}</span>
        )}
      </div>

      {idea.tags && idea.tags.length > 0 && (
        <div className="idea-tags">
          {idea.tags.map((tag, index) => (
            <span key={index} className="idea-tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
