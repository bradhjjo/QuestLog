import React from 'react';

const Layout = ({ children, role, onLogout }) => {
  return (
    <div className="layout">
      <header className="header">
        <div className="container header-content">
          <h1 className="logo title-gradient">QuestLog</h1>
          <div className="user-controls">
            <span className="role-badge">{role === 'parent' ? '🛡️ Parent' : '⚔️ Teen'}</span>
            <button onClick={onLogout} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>
              Switch Role
            </button>
          </div>
        </div>
      </header>
      <main className="main-content container">
        {children}
      </main>
      
      <style>{`
        .header {
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          padding: var(--spacing-sm) 0;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0;
          padding-bottom: 0;
        }
        .logo {
          font-size: var(--font-size-xl);
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .user-controls {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        .role-badge {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          background: var(--bg-card);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
};

export default Layout;
