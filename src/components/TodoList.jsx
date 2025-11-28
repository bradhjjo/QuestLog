import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const TodoList = ({ role, todos, onAdd, onDelete, onToggle, onApprove, children }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newReward, setNewReward] = useState(10);
  const [showCompleted, setShowCompleted] = useState(false);
  const [recentQuests, setRecentQuests] = useState([]);
  const [selectedRecent, setSelectedRecent] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [timeLimit, setTimeLimit] = useState('');

  // Fetch recent quests for dropdown
  useEffect(() => {
    if (role === 'parent') {
      fetchRecentQuests();
    }
  }, [role, todos]); // Re-fetch when todos change

  const fetchRecentQuests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('todos')
      .select('title, reward')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .order('inserted_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent quests:', error);
      return;
    }

    // Get unique combinations of title + reward
    const uniqueQuests = [];
    const seen = new Set();

    data?.forEach(quest => {
      const key = `${quest.title}-${quest.reward}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueQuests.push(quest);
      }
    });

    setRecentQuests(uniqueQuests);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTitle.trim()) {
      let expiresAt = null;
      if (timeLimit) {
        const now = new Date();
        const hours = parseInt(timeLimit);
        now.setHours(now.getHours() + hours);
        expiresAt = now.toISOString();
      }

      onAdd(newTitle, newReward, isDaily, expiresAt);
      setNewTitle('');
      setNewReward(10);
      setSelectedRecent('');
      setIsDaily(false);
      setTimeLimit('');
    }
  };

  const handleRecentSelect = (e) => {
    const value = e.target.value;
    setSelectedRecent(value);

    if (value) {
      const [title, reward] = value.split('|||');
      setNewTitle(title);
      setNewReward(parseInt(reward));
    }
  };

  // Filter todos based on showCompleted toggle
  const filteredTodos = showCompleted
    ? todos
    : todos.filter(todo => todo.status !== 'approved');

  return (
    <div className="todo-list">
      {role === 'parent' && (
        <form onSubmit={handleSubmit} className="add-task-form card">
          <h3 className="title-gradient">Add New Quest</h3>
          <div className="form-group">
            {recentQuests.length > 0 && (
              <select
                value={selectedRecent}
                onChange={handleRecentSelect}
                className="input"
                style={{ marginBottom: 'var(--spacing-sm)' }}
              >
                <option value="">Or select from recent quests...</option>
                {recentQuests.map((quest, idx) => (
                  <option key={idx} value={`${quest.title}|||${quest.reward}`}>
                    {quest.title} ({quest.reward} XP)
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Quest description..."
              className="input"
            />
            <div className="form-row">
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
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              marginTop: 'var(--spacing-sm)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}>
              <input
                type="checkbox"
                checked={isDaily}
                onChange={(e) => setIsDaily(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              🔄 Daily Quest (resets every day at 6 AM)
            </label>

            <div style={{ marginTop: 'var(--spacing-sm)' }}>
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="input"
                style={{ width: '100%' }}
              >
                <option value="">⏱️ No Time Limit</option>
                <option value="1">⏱️ 1 Hour (Event Quest)</option>
                <option value="3">⏱️ 3 Hours (Event Quest)</option>
                <option value="12">⏱️ 12 Hours (Event Quest)</option>
                <option value="24">⏱️ 24 Hours (Event Quest)</option>
              </select>
            </div>
          </div>
        </form>
      )}

      <div className="tasks-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Active Quests</h3>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.875rem' }}
          >
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
        </div>
        {filteredTodos.length === 0 ? (
          <p className="empty-state">No active quests available.</p>
        ) : (
          <div className="tasks-grid">
            {filteredTodos.map(todo => (
              <div key={todo.id} className={`task-card ${todo.status} ${todo.expires_at ? 'event-quest' : ''}`}>
                <div className="task-content">
                  <div className="task-header">
                    {todo.is_daily && <span style={{ fontSize: '1rem', marginRight: '0.25rem' }}>🔄</span>}
                    {todo.expires_at && <CountdownTimer expiresAt={todo.expires_at} />}
                    <span className="xp-badge">+{todo.reward} XP</span>
                    <span className={`status-badge ${todo.status}`}>{todo.status}</span>
                  </div>
                  <h4>{todo.title}</h4>
                  {role === 'parent' && todo.status === 'completed' && todo.completed_by && children && (
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      marginTop: 'var(--spacing-xs)'
                    }}>
                      Completed by: {children.find(c => c.id === todo.completed_by)?.username || 'Teen User'}
                    </p>
                  )}
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
                      {todo.status === 'approved' && (
                        <button
                          onClick={() => onAdd(todo.title, todo.reward, todo.is_daily)}
                          className="btn btn-primary btn-sm"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          🔄 Repeat
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
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }
        .form-row {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
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
          width: 100%;
        }
        .reward-input {
          flex: 1;
          min-width: 100px;
        }
        .btn-primary {
          flex: 1;
          min-width: 120px;
        }
        
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
          }
          .reward-input,
          .btn-primary {
            width: 100%;
          }
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

const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(expiresAt);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`⏳ ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return <span className="countdown-timer">{timeLeft}</span>;
};

export default TodoList;
