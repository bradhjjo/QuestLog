import React, { useState } from 'react';
import { useRewards } from '../hooks/useRewards';

const RewardShop = ({ role, xp, onSpend }) => {
  const { rewards, addReward, updateReward, deleteReward } = useRewards();
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({ title: '', cost: '', icon: '🎁' });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingReward) {
      await updateReward(editingReward.id, formData.title, formData.cost, formData.icon);
    } else {
      await addReward(formData.title, formData.cost, formData.icon);
    }
    setFormData({ title: '', cost: '', icon: '🎁' });
    setShowForm(false);
    setEditingReward(null);
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({ title: reward.title, cost: reward.cost, icon: reward.icon });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      await deleteReward(id);
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', cost: '', icon: '🎁' });
    setShowForm(false);
    setEditingReward(null);
  };

  return (
    <div className="reward-shop">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h3 className="title-gradient">Loot Box</h3>
        {role === 'parent' && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            + Add Reward
          </button>
        )}
      </div>

      {showForm && role === 'parent' && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h4 style={{ marginBottom: 'var(--spacing-md)' }}>
            {editingReward ? 'Edit Reward' : 'New Reward'}
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label>Icon</label>
              <input
                className="input"
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🎁"
                maxLength={2}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label>Title</label>
              <input
                className="input"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Reward name"
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
              <label>Cost (XP)</label>
              <input
                className="input"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="100"
                min="1"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button type="submit" className="btn btn-primary">
                {editingReward ? 'Update' : 'Add'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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

            {role === 'parent' && (
              <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: 'var(--spacing-md)' }}>
                <button
                  onClick={() => handleEdit(reward)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(reward.id)}
                  className="btn btn-secondary btn-sm danger"
                  style={{ flex: 1 }}
                >
                  Delete
                </button>
              </div>
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
