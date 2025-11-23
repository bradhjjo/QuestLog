import React, { useState } from 'react';

const DEFAULT_REWARDS = [
    { id: 1, title: '1 Hour Screen Time', cost: 100, icon: '📱' },
    { id: 2, title: 'Pizza Night', cost: 500, icon: '🍕' },
    { id: 3, title: 'New Game', cost: 2000, icon: '🎮' },
    { id: 4, title: 'Movie Ticket', cost: 300, icon: '🎬' },
];

const RewardShop = ({ role, xp, onSpend }) => {
    const [rewards] = useState(DEFAULT_REWARDS);

    const handleRedeem = (reward) => {
        if (xp >= reward.cost) {
            const success = onSpend(reward.cost);
            if (success) {
                alert(`Redeemed: ${reward.title}!`);
            }
        } else {
            alert("Not enough XP!");
        }
    };

    return (
        <div className="reward-shop">
            <h3 className="title-gradient" style={{ marginBottom: 'var(--spacing-lg)' }}>Loot Box</h3>

            <div className="rewards-grid">
                {rewards.map(reward => (
                    <div key={reward.id} className={`reward-card ${xp >= reward.cost ? 'affordable' : 'locked'}`}>
                        <div className="reward-icon">{reward.icon}</div>
                        <h4>{reward.title}</h4>
                        <div className="reward-cost">
                            <span className="cost-value">{reward.cost} XP</span>
                        </div>

                        {role === 'teen' && (
                            <button
                                onClick={() => handleRedeem(reward)}
                                disabled={xp < reward.cost}
                                className={`btn ${xp >= reward.cost ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                            >
                                Redeem
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
        .rewards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--spacing-md);
        }
        .reward-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          text-align: center;
          transition: all 0.3s ease;
        }
        .reward-card:hover {
          transform: translateY(-5px);
        }
        .reward-card.affordable {
          border-color: var(--accent-secondary);
          box-shadow: 0 0 15px rgba(189, 0, 255, 0.1);
        }
        .reward-card.locked {
          opacity: 0.7;
          filter: grayscale(0.5);
        }
        .reward-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }
        .reward-cost {
          margin-top: var(--spacing-xs);
          font-weight: bold;
          color: var(--accent-secondary);
        }
      `}</style>
        </div>
    );
};

export default RewardShop;
