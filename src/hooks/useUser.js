import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useUser = () => {
    const [xp, setXp] = useState(0);
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
            .select('xp')
            .eq('id', id)
            .single();

        if (error) console.error('Error fetching profile:', error);
        else setXp(data?.xp || 0);
    };

    const addXp = async (amount) => {
        if (!userId) return;

        const { error } = await supabase
            .from('profiles')
            .update({ xp: xp + amount })
            .eq('id', userId);

        if (error) console.error('Error adding XP:', error);
    };

    const spendXp = async (amount) => {
        if (!userId || xp < amount) return false;

        const { error } = await supabase
            .from('profiles')
            .update({ xp: xp - amount })
            .eq('id', userId);

        if (error) {
            console.error('Error spending XP:', error);
            return false;
        }
        return true;
    };

    return {
        xp,
        addXp,
        spendXp
    };
};
