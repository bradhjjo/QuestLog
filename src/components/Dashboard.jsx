import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import TodoList from './TodoList';
import RewardShop from './RewardShop';
import LevelProgress from './LevelProgress';
import Achievements from './Achievements';
import { useTodos } from '../hooks/useTodos';
import { useUser } from '../hooks/useUser';
import { useChildren } from '../hooks/useChildren';
import { useAchievements } from '../hooks/useAchievements';
import { useNotifications } from '../hooks/useNotifications';
import { soundManager } from '../utils/soundManager';

import { supabase } from '../supabaseClient';

const Dashboard = ({ role, initialTab = 'quests' }) => {
    const { todos, addTodo, deleteTodo, toggleComplete, approveTodo } = useTodos();
    const { xp, level, avatarId, updateAvatar, addXp, spendXp } = useUser();
    const { children } = useChildren();
    const { checkAndUnlock } = useAchievements();
    const { permission, requestPermission, showLocalNotification } = useNotifications();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    const AVATARS = [
        { id: 'starter_1', icon: '👤', name: 'Rookie' },
        { id: 'warrior', icon: '⚔️', name: 'Warrior' },
        { id: 'mage', icon: '🧙', name: 'Mage' },
        { id: 'ninja', icon: '🥷', name: 'Ninja' },
        { id: 'robot', icon: '🤖', name: 'Bot' },
        { id: 'ghost', icon: '👻', name: 'Spooky' },
    ];
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Pokemon evolution based on level
    const getPokemon = (lvl) => {
        if (lvl <= 1) return '🥚'; // Egg
        if (lvl <= 2) return '🐣'; // Hatching
        if (lvl <= 3) return '🐥'; // Chick
        if (lvl <= 4) return '🐛'; // Caterpie
        if (lvl <= 5) return '🦋'; // Butterfree
        if (lvl <= 6) return '🔥'; // Charmander
        if (lvl <= 7) return '🦖'; // Charmeleon
        if (lvl <= 8) return '🐉'; // Charizard
        if (lvl <= 9) return '🐲'; // Ancient Dragon
        return '🌌'; // Cosmic Entity
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

                // Check for achievements
                // 1. Level reached
                checkAndUnlock(todo.completed_by, 'level_reached', newLevel);

                // 2. Total quests approved
                const { count: approvedCount } = await supabase
                    .from('todos')
                    .select('*', { count: 'exact', head: true })
                    .eq('completed_by', todo.completed_by)
                    .eq('status', 'approved');

                checkAndUnlock(todo.completed_by, 'total_quests', (approvedCount || 0) + 1);

                // 3. Daily quests count
                if (todo.is_daily) {
                    const { count: dailyCount } = await supabase
                        .from('todos')
                        .select('*', { count: 'exact', head: true })
                        .eq('completed_by', todo.completed_by)
                        .eq('status', 'approved')
                        .eq('is_daily', true);

                    checkAndUnlock(todo.completed_by, 'daily_quests', (dailyCount || 0) + 1);
                }
            }

            // Auto-delete after 3 seconds
            setTimeout(() => {
                deleteTodo(id);
            }, 3000);
        } else if (todo) {
            // Fallback if completed_by is missing (legacy tasks)
            approveTodo(id);

            // Auto-delete after 3 seconds
            setTimeout(() => {
                deleteTodo(id);
            }, 3000);
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

    // Real-time notification listener
    useEffect(() => {
        if (permission !== 'granted') return;

        const channel = supabase
            .channel('questlog-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'todos'
            }, (payload) => {
                if (role === 'teen' && payload.new.status === 'pending') {
                    showLocalNotification('⚔️ New Quest Alert!', {
                        body: `New quest added: ${payload.new.title}`,
                        tag: `new-quest-${payload.new.id}`
                    });
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'todos'
            }, (payload) => {
                if (role === 'parent' && payload.new.status === 'completed' && payload.old.status !== 'completed') {
                    showLocalNotification('✅ Quest Completed!', {
                        body: `A quest was marked as complete! Review and approve it.`,
                        tag: `complete-quest-${payload.new.id}`
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [role, permission]);

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
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => role === 'teen' && setShowAvatarPicker(!showAvatarPicker)}
                                style={{
                                    fontSize: '3rem',
                                    cursor: role === 'teen' ? 'pointer' : 'default',
                                    background: 'var(--bg-secondary)',
                                    width: '80px',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 'var(--radius-full)',
                                    border: '2px solid var(--accent-primary)',
                                    boxShadow: 'var(--shadow-glow-green)'
                                }}
                            >
                                {AVATARS.find(a => a.id === avatarId)?.icon || '👤'}
                            </div>
                            <AnimatePresence>
                                {showAvatarPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                        className="card avatar-picker"
                                        style={{
                                            position: 'absolute',
                                            top: '90px',
                                            left: '0',
                                            zIndex: 100,
                                            width: '240px',
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: 'var(--spacing-sm)',
                                            padding: 'var(--spacing-sm)'
                                        }}
                                    >
                                        {AVATARS.map(avatar => (
                                            <button
                                                key={avatar.id}
                                                onClick={() => {
                                                    updateAvatar(avatar.id);
                                                    setShowAvatarPicker(false);
                                                    soundManager.playClick();
                                                }}
                                                style={{
                                                    fontSize: '2rem',
                                                    padding: 'var(--spacing-xs)',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: avatarId === avatar.id ? 'var(--bg-primary)' : 'transparent',
                                                    border: avatarId === avatar.id ? '1px solid var(--accent-primary)' : 'none'
                                                }}
                                            >
                                                {avatar.icon}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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
                {role === 'teen' && <LevelProgress xp={xp} level={level} />}
                {role === 'parent' && (
                    <div className="children-list">
                        <h3 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                            👨‍👩‍👧‍👦 Teen Progress
                        </h3>
                        {children.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No teen accounts found.</p>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: 'var(--spacing-md)'
                            }}>
                                {children.map(child => (
                                    <div key={child.id} style={{
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-color)',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            fontSize: '2.5rem',
                                            animation: 'bounce 2s infinite',
                                            marginBottom: 'var(--spacing-sm)'
                                        }}>
                                            {getPokemon(child.level || 1)}
                                        </div>
                                        <h4 style={{
                                            margin: 0,
                                            color: 'var(--text-primary)',
                                            fontSize: '1rem'
                                        }}>
                                            {child.username || 'Teen User'}
                                        </h4>
                                        <p style={{
                                            margin: '0.25rem 0',
                                            color: 'var(--accent-primary)',
                                            fontWeight: 'bold',
                                            fontSize: '0.875rem'
                                        }}>
                                            Level {child.level || 1}
                                        </p>
                                        <div style={{
                                            height: '8px',
                                            background: 'var(--bg-primary)',
                                            borderRadius: 'var(--radius-sm)',
                                            overflow: 'hidden',
                                            marginTop: 'var(--spacing-sm)',
                                            marginBottom: '0.25rem'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                                                width: `${Math.min(((child.xp || 0) / 500) * 100, 100)}%`,
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                        <p style={{
                                            margin: 0,
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.75rem'
                                        }}>
                                            {child.xp || 0} / 500 XP
                                        </p>
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
                    className={`btn ${activeTab === 'achievements' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('achievements')}
                >
                    Hall of Fame
                </button>
                <button
                    className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
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

                    {activeTab === 'achievements' && (
                        <Achievements />
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
                                <button className="btn btn-primary" disabled={loading} style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 'var(--spacing-lg) 0' }} />

                            <div className="notification-settings">
                                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Push Notifications</h4>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                                    Get notified when new quests are added or completed.
                                </p>
                                {permission === 'granted' ? (
                                    <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                                        ✅ Notifications Enabled
                                    </div>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            const granted = await requestPermission();
                                            if (granted) {
                                                // Save to profiles (future-proofing for true push)
                                                const { data: { user } } = await supabase.auth.getUser();
                                                if (user) {
                                                    await supabase
                                                        .from('profiles')
                                                        .update({ push_subscription: { status: 'granted', updated_at: new Date().toISOString() } })
                                                        .eq('id', user.id);
                                                }

                                                showLocalNotification('Notifications Enabled!', {
                                                    body: 'You will now receive quest updates.'
                                                });
                                            } else {
                                                alert('Notification permission denied.');
                                            }
                                        }}
                                        className="btn btn-secondary"
                                        style={{ width: '100%' }}
                                    >
                                        🔔 Enable Notifications
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
