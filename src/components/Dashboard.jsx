import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import TodoList from './TodoList';
import RewardShop from './RewardShop';
import LevelProgress from './LevelProgress';
import { useTodos } from '../hooks/useTodos';
import { useUser } from '../hooks/useUser';
import { useChildren } from '../hooks/useChildren';

import { supabase } from '../supabaseClient';

const Dashboard = ({ role, initialTab = 'quests' }) => {
    const { todos, addTodo, deleteTodo, toggleComplete, approveTodo } = useTodos();
    const { xp, level, addXp, spendXp } = useUser();
    const { children } = useChildren();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Pokemon evolution based on level
    const getPokemon = (lvl) => {
        if (lvl <= 2) return '🥚'; // Egg
        if (lvl <= 4) return '🐛'; // Caterpie
        if (lvl <= 6) return '🦋'; // Butterfree
        if (lvl <= 8) return '🔥'; // Charmander
        return '🐉'; // Charizard
    };

    const handleApprove = async (id) => {
        const todo = todos.find(t => t.id === id);
        if (todo && todo.completed_by) {
            approveTodo(id);

            // Update the XP of the user who COMPLETED the task
            const { data: profile } = await supabase
                .from('profiles')
                .select('xp, total_xp_earned, level')
                .eq('id', todo.completed_by)
                .single();

            if (profile) {
                const newTotalXp = (profile.total_xp_earned || 0) + todo.reward;
                const newLevel = calculateLevel(newTotalXp);

                const { error } = await supabase
                    .from('profiles')
                    .update({
                        xp: profile.xp + todo.reward,
                        total_xp_earned: newTotalXp,
                        level: newLevel
                    })
                    .eq('id', todo.completed_by);

                if (error) console.error('Error updating XP:', error);
            }

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } else if (todo) {
            // Fallback if completed_by is missing (legacy tasks)
            approveTodo(id);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            alert('Password updated successfully!');
            setNewPassword('');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Calculate level from total XP
    const calculateLevel = (totalXp) => {
        if (totalXp < 100) return 1;
        if (totalXp < 300) return 2;
        if (totalXp < 600) return 3;
        if (totalXp < 1000) return 4;
        if (totalXp < 1500) return 5;
        if (totalXp < 2100) return 6;
        if (totalXp < 2800) return 7;
        if (totalXp < 3600) return 8;
        if (totalXp < 4500) return 9;
        return 10;
    };

    return (
        <div className="dashboard">
            <div className="stats-bar card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        {role === 'teen' && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '3rem',
                                    animation: 'bounce 2s infinite',
                                    filter: 'drop-shadow(0 4px 8px rgba(0, 255, 157, 0.3))'
                                }}>
                                    {getPokemon(level)}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--accent-primary)',
                                    fontWeight: 'bold',
                                    marginTop: '-0.5rem'
                                }}>
                                    Lv.{level}
                                </div>
                            </div>
                        )}
                        <div>
                            <h2 className="title-gradient">Mission Control</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Welcome back, {role === 'parent' ? 'Commander' : 'Adventurer'}!
                            </p>
                        </div>
                    </div>
                    {role === 'teen' && (
                        <div className="xp-display">
                            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{xp} XP</span>
                        </div>
                    )}
                </div>
                {role === 'teen' && <LevelProgress xp={xp} />}
                {role === 'parent' && (
                    <div className="children-list">
                        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>Children Progress</h3>
                        {children.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No children accounts found.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                                {children.map(child => (
                                    <div key={child.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--spacing-sm)',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <span style={{ color: 'var(--text-primary)' }}>{child.username || 'Teen User'}</span>
                                        <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{child.xp} XP</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="tabs" style={{ marginBottom: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-md)' }}>
                <button
                    className={`btn ${activeTab === 'quests' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('quests')}
                >
                    Quests
                </button>
                <button
                    className={`btn ${activeTab === 'rewards' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('rewards')}
                >
                    Rewards
                </button>
                <button
                    className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>

            {activeTab === 'quests' && (
                <TodoList
                    role={role}
                    todos={todos}
                    onAdd={addTodo}
                    onDelete={deleteTodo}
                    onToggle={toggleComplete}
                    onApprove={handleApprove}
                    children={children}
                />
            )}

            {activeTab === 'rewards' && (
                <RewardShop
                    role={role}
                    xp={xp}
                    onSpend={spendXp}
                />
            )}

            {activeTab === 'settings' && (
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Settings</h3>
                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>New Password</label>
                            <input
                                className="input"
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <button className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
