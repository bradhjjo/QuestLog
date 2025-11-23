import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Layout from './components/Layout';
import RoleSelection from './components/RoleSelection';
import Dashboard from './components/Dashboard';
import InstallPrompt from './components/InstallPrompt';
import Auth from './components/Auth';

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
      if (session) fetchProfile(session.user.id);
      else setRole(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) setRole(data.role);
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    }
  };

  const handleRoleSelect = async (selectedRole) => {
    // In Supabase version, role is determined by profile, but we keep this for UI consistency if needed
    // or we could update the profile here if we wanted to allow role switching (not typical for this app but ok for prototype)
    setRole(selectedRole);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setSession(null);
    setRecoveryMode(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        Loading QuestLog...
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <InstallPrompt />
        <Auth onLogin={setSession} />
      </>
    );
  }

  return (
    <>
      <InstallPrompt />
      {!role ? (
        <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading Profile...</div>
      ) : (
        <Layout role={role} onLogout={handleLogout}>
          <Dashboard role={role} initialTab={recoveryMode ? 'settings' : 'quests'} />
        </Layout>
      )}
    </>
  );
}

export default App;
