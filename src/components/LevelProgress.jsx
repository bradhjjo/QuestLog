import React from 'react';

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

const LevelProgress = ({ xp, level }) => {
  // If level isn't provided, calculate it (fallback)
  const calculatedLevel = level || (() => {
    const currentLevel = LEVEL_THRESHOLDS.findIndex(threshold => xp < threshold);
    return currentLevel === -1 ? LEVEL_THRESHOLDS.length : currentLevel;
  })();

  const currentLevelXp = LEVEL_THRESHOLDS[calculatedLevel - 1] || 0;
  const nextLevelXp = LEVEL_THRESHOLDS[calculatedLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];

  const progress = Math.min(100, Math.max(0, ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100));

  return (
    <div className="level-progress">
      <div className="level-info">
        <span className="level-badge">Lvl {calculatedLevel}</span>
        <span className="xp-text">{xp} / {nextLevelXp} XP</span>
      </div>
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <style>{`
        .level-progress {
          margin-bottom: var(--spacing-md);
          background: var(--bg-secondary);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
        }
        .level-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          font-size: var(--font-size-sm);
        }
        .level-badge {
          font-weight: bold;
          color: var(--accent-secondary);
        }
        .xp-text {
          color: var(--text-muted);
        }
        .progress-bar-container {
          height: 6px;
          background: var(--bg-primary);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-secondary), var(--accent-primary));
          border-radius: var(--radius-full);
          transition: width 0.5s ease-out;
          box-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
        }
      `}</style>
    </div>
  );
};

export default LevelProgress;
