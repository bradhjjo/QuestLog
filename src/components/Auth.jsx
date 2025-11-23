import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Auth = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [role, setRole] = useState('teen');
    const [username, setUsername] = useState('');
    const [resetMode, setResetMode] = useState(false);

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });
            if (error) throw error;
            alert('Check your email for the password reset link!');
            setResetMode(false);
        } catch (error) {
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username,
                            role,
                        },
                    },
                });
                if (error) throw error;

                // Create profile record
                if (data.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: data.user.id,
                                username,
                                role,
                                xp: 0
                            }
                        ]);
                    if (profileError) throw profileError;
                }

                alert('Check your email for the login link!');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onLogin(data.session);
            }
        } catch (error) {
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <h1 className="title-gradient" style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    {resetMode ? 'Reset Password' : (isSignUp ? 'Join the Quest' : 'Login to QuestLog')}
                </h1>

                {resetMode ? (
                    <form onSubmit={handlePasswordReset} className="auth-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                className="input"
                                type="email"
                                placeholder="Your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setResetMode(false)}
                            style={{ width: '100%' }}
                        >
                            Back to Login
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleAuth} className="auth-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                className="input"
                                type="email"
                                placeholder="Your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                className="input"
                                type="password"
                                placeholder="Your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {!isSignUp && (
                                <button
                                    type="button"
                                    className="btn-link"
                                    onClick={() => setResetMode(true)}
                                    style={{ fontSize: '0.8rem', textAlign: 'right', color: 'var(--text-secondary)' }}
                                >
                                    Forgot Password?
                                </button>
                            )}
                        </div>

                        {isSignUp && (
                            <>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        className="input"
                                        type="text"
                                        placeholder="Hero Name"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Role</label>
                                    <div className="role-select">
                                        <button
                                            type="button"
                                            className={`btn ${role === 'parent' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setRole('parent')}
                                        >
                                            Parent
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${role === 'teen' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setRole('teen')}
                                        >
                                            Teenager
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        <button className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 'var(--spacing-md)' }}>
                            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
                        </button>
                    </form>
                )}

                {!resetMode && (
                    <p style={{ textAlign: 'center', marginTop: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                        <button
                            className="btn-link"
                            onClick={() => setIsSignUp(!isSignUp)}
                            style={{ color: 'var(--accent-primary)', marginLeft: 'var(--spacing-sm)', textDecoration: 'underline' }}
                        >
                            {isSignUp ? 'Login' : 'Sign Up'}
                        </button>
                    </p>
                )}
            </div>

            <style>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: var(--spacing-md);
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        .role-select {
          display: flex;
          gap: var(--spacing-sm);
        }
        .role-select button {
          flex: 1;
        }
      `}</style>
        </div>
    );
};

export default Auth;
