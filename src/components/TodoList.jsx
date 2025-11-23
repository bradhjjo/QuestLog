import React, { useState } from 'react';

const TodoList = ({ role, todos, onAdd, onDelete, onToggle, onApprove }) => {
    const [newTitle, setNewTitle] = useState('');
    const [newReward, setNewReward] = useState(10);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newTitle.trim()) {
            onAdd(newTitle, newReward);
            setNewTitle('');
            setNewReward(10);
        }
    };

    return (
        <div className="todo-list">
            {role === 'parent' && (
                <form onSubmit={handleSubmit} className="add-task-form card">
                    <h3 className="title-gradient">Add New Quest</h3>
                    <div className="form-group">
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Quest description..."
                            className="input"
                        />
                        <input
                            type="number"
                            value={newReward}
                            onChange={(e) => setNewReward(e.target.value)}
                            placeholder="XP Reward"
                            className="input reward-input"
                            min="1"
                        />
                        <button type="submit" className="btn btn-primary">Add Quest</button>
                    </div>
                </form>
            )}

            <div className="tasks-container">
                <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>Active Quests</h3>
                {todos.length === 0 ? (
                    <p className="empty-state">No active quests available.</p>
                ) : (
                    <div className="tasks-grid">
                        {todos.map(todo => (
                            <div key={todo.id} className={`task-card ${todo.status}`}>
                                <div className="task-content">
                                    <div className="task-header">
                                        <span className="xp-badge">+{todo.reward} XP</span>
                                        <span className={`status-badge ${todo.status}`}>{todo.status}</span>
                                    </div>
                                    <h4>{todo.title}</h4>
                                </div>

                                <div className="task-actions">
                                    {role === 'teen' && todo.status === 'pending' && (
                                        <button onClick={() => onToggle(todo.id)} className="btn btn-primary btn-sm">
                                            Complete
                                        </button>
                                    )}
                                    {role === 'teen' && todo.status === 'completed' && (
                                        <button onClick={() => onToggle(todo.id)} className="btn btn-secondary btn-sm">
                                            Undo
                                        </button>
                                    )}

                                    {role === 'parent' && (
                                        <>
                                            {todo.status === 'completed' && (
                                                <button onClick={() => onApprove(todo.id)} className="btn btn-primary btn-sm">
                                                    Approve
                                                </button>
                                            )}
                                            <button onClick={() => onDelete(todo.id)} className="btn btn-secondary btn-sm danger">
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        .add-task-form {
          margin-bottom: var(--spacing-xl);
        }
        .form-group {
          display: flex;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }
        .input {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: var(--spacing-sm);
          border-radius: var(--radius-md);
          font-family: inherit;
        }
        .input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
        .input[type="text"] {
          flex: 1;
        }
        .reward-input {
          width: 100px;
        }
        
        .tasks-grid {
          display: grid;
          gap: var(--spacing-md);
        }
        .task-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
        }
        .task-card.completed {
          border-color: var(--accent-warning);
          background: rgba(255, 204, 0, 0.05);
        }
        .task-card.approved {
          border-color: var(--accent-primary);
          background: rgba(0, 255, 157, 0.05);
          opacity: 0.7;
        }
        
        .task-header {
          display: flex;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xs);
        }
        .xp-badge {
          color: var(--accent-primary);
          font-weight: bold;
          font-size: var(--font-size-sm);
        }
        .status-badge {
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          font-weight: bold;
        }
        .status-badge.pending { background: var(--bg-secondary); color: var(--text-muted); }
        .status-badge.completed { background: var(--accent-warning); color: var(--bg-primary); }
        .status-badge.approved { background: var(--accent-primary); color: var(--bg-primary); }

        .task-actions {
          display: flex;
          gap: var(--spacing-sm);
        }
        .btn-sm {
          padding: 0.25rem 0.75rem;
          font-size: 0.875rem;
        }
        .danger {
          color: var(--accent-danger);
          border-color: var(--accent-danger);
        }
        .danger:hover {
          background: var(--accent-danger);
          color: white;
        }
      `}</style>
        </div>
    );
};

export default TodoList;
