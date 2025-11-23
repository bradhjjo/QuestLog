import React from 'react';

const RoleSelection = ({ onSelectRole }) => {
    return (
        <div className="role-selection-container">
            <div className="card role-card">
                <h1 className="title-gradient" style={{ marginBottom: '2rem', textAlign: 'center' }}>Choose Your Character</h1>

                <div className="roles-grid">
                    <button
                        className="role-btn parent-role"
                        onClick={() => onSelectRole('parent')}
                    >
                        <div className="icon">🛡️</div>
                        <h3>Parent</h3>
                        <p>Quest Giver</p>
                    </button>

                    <button
                        className="role-btn teen-role"
                        onClick={() => onSelectRole('teen')}
                    >
                        <div className="icon">⚔️</div>
                        <h3>Teenager</h3>
                        <p>Quest Hunter</p>
                    </button>
                </div>
            </div>

            <style>{`
        .role-selection-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: var(--spacing-md);
        }
        .role-card {
          width: 100%;
          max-width: 600px;
          text-align: center;
        }
        .roles-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-lg);
        }
        .role-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--spacing-xl);
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          transition: all 0.3s ease;
        }
        .role-btn:hover {
          border-color: var(--accent-primary);
          transform: translateY(-5px);
          box-shadow: var(--shadow-glow-green);
        }
        .role-btn.parent-role:hover {
          border-color: var(--accent-secondary);
          box-shadow: var(--shadow-glow-purple);
        }
        .icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }
        .role-btn h3 {
          font-size: var(--font-size-lg);
          margin-bottom: var(--spacing-xs);
          color: var(--text-primary);
        }
        .role-btn p {
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
        }
      `}</style>
        </div>
    );
};

export default RoleSelection;
