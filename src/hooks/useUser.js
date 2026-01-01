import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Calculate level from total XP earned
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

export const useUser = () => {
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [totalXpEarned, setTotalXpEarned] = useState(0);
    const [avatarId, setAvatarId] = useState('starter_1');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUserId(user.id);
                fetchProfile(user.id);

                const channel = supabase
                    .channel(`public:profiles:${user.id}`)
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${user.id}`
                    }, (payload) => {
                        setXp(payload.new.xp);
                        setLevel(payload.new.level || calculateLevel(payload.new.total_xp_earned || 0));
                        setTotalXpEarned(payload.new.total_xp_earned || 0);
                        setAvatarId(payload.new.avatar_id || 'starter_1');
                    })
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            }
        });
    }, []);

    const fetchProfile = async (id) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('xp, level, total_xp_earned, avatar_id')
            .eq('id', id)
            .single();

        if (error) console.error('Error fetching profile:', error);
        else {
            setXp(data?.xp || 0);
            const totalXp = data?.total_xp_earned || 0;
            setTotalXpEarned(totalXp);
            setLevel(data?.level || calculateLevel(totalXp));
            setAvatarId(data?.avatar_id || 'starter_1');
        }
    };

    const updateAvatar = async (newAvatarId) => {
        if (!userId) return;

        setAvatarId(newAvatarId);
        const { error } = await supabase
            .from('profiles')
            .update({ avatar_id: newAvatarId })
            .eq('id', userId);

        if (error) {
            console.error('Error updating avatar:', error);
            // Re-fetch to sync
            fetchProfile(userId);
        }
    };

    const addXp = async (amount) => {
        if (!userId) return;

        const newTotalXp = totalXpEarned + amount;
        const newLevel = calculateLevel(newTotalXp);

        // Optimistic update: Update XP immediately
        setXp(prev => prev + amount);
        setTotalXpEarned(newTotalXp);
        setLevel(newLevel);

        // Server update
        const { error } = await supabase
            .from('profiles')
            .update({
                xp: xp + amount,
                total_xp_earned: newTotalXp,
                level: newLevel
            })
            .eq('id', userId);

        if (error) {
            console.error('Error adding XP:', error);
            // Rollback on error
            setXp(prev => prev - amount);
            setTotalXpEarned(totalXpEarned);
            setLevel(calculateLevel(totalXpEarned));
        }
    };

    const spendXp = async (amount) => {
        if (!userId || xp < amount) return false;

        // Optimistic update: Deduct XP immediately
        const previousXp = xp;
        setXp(prev => prev - amount);

        // Server update
        const { error } = await supabase
            .from('profiles')
            .update({ xp: xp - amount })
            .eq('id', userId);

        if (error) {
            console.error('Error spending XP:', error);
            // Rollback on error
            setXp(previousXp);
            return false;
        }
        return true;
    };

    return {
        xp,
        level,
        totalXpEarned,
        avatarId,
        addXp,
        spendXp,
        updateAvatar
    };
};
