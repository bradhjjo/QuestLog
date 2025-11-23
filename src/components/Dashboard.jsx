import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import TodoList from './TodoList';
import RewardShop from './RewardShop';
import LevelProgress from './LevelProgress';
import { useTodos } from '../hooks/useTodos';
import { useUser } from '../hooks/useUser';

import { supabase } from '../supabaseClient';

const Dashboard = ({ role }) => {
    const { todos, addTodo, deleteTodo, toggleComplete, approveTodo } = useTodos();
    const { xp, addXp, spendXp } = useUser();
    const [activeTab, setActiveTab] = useState('quests');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApprove = (id) => {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            approveTodo(id);
            addXp(todo.reward);
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

    return (
        <div className="dashboard">
            <div className="stats-bar card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                    <div>
                        <h2 className="title-gradient">Mission Control</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Welcome back, {role === 'parent' ? 'Commander' : 'Adventurer'}!
                        </p>
                    </div>
                    <div className="xp-display">
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{xp} XP</span>
                    </div>
                </div>
                <LevelProgress xp={xp} />
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
