import React from 'react';
import { useAchievements } from '../hooks/useAchievements';

const Achievements = () => {
    const { achievements, userAchievements, loading } = useAchievements();

    if (loading) return <div style={{ color: 'white', textAlign: 'center' }}>Loading Achievements...</div>;

    const isUnlocked = (achievementId) => {
        return userAchievements.some(ua => ua.achievement_id === achievementId);
    };

    return (
        <div className="achievements-container card">
            <h3 className="title-gradient" style={{ marginBottom: 'var(--spacing-lg)' }}>🏅 Achievement Hall</h3>
            <div className="achievements-grid">
                {achievements.map(achievement => {
                    const unlocked = isUnlocked(achievement.id);
                    return (
                        <div
                            key={achievement.id}
                            className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`}
                        >
                            <div className="achievement-icon">
                                {unlocked ? achievement.icon : '🔒'}
                            </div>
                            <div className="achievement-info">
                                <h4>{achievement.name}</h4>
                                <p>{achievement.description}</p>
                            </div>
                            {unlocked && (
                                <div className="unlock-date">
                                    {new Date(userAchievements.find(ua => ua.achievement_id === achievement.id).unlocked_at).toLocaleDateString()}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
                .achievements-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: var(--spacing-md);
                }
                .achievement-card {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-md);
                    background: var(--bg-secondary);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;
                    position: relative;
                }
                .achievement-card.unlocked {
                    border-color: var(--accent-primary);
                    background: rgba(0, 255, 157, 0.05);
                    box-shadow: 0 0 10px rgba(0, 255, 157, 0.1);
                }
                .achievement-card.locked {
                    opacity: 0.6;
                    filter: grayscale(1);
                }
                .achievement-icon {
                    font-size: 2.5rem;
                    min-width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-primary);
                    border-radius: var(--radius-full);
                }
                .achievement-info h4 {
                    margin: 0;
                    color: var(--text-primary);
                }
                .achievement-info p {
                    margin: 4px 0 0;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }
                .unlock-date {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    font-size: 0.65rem;
                    color: var(--accent-primary);
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
};

export default Achievements;
