import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useRewards = () => {
    const [rewards, setRewards] = useState([]);

    useEffect(() => {
        fetchRewards();

        const channel = supabase
            .channel('public:rewards')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rewards' }, (payload) => {
                fetchRewards();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchRewards = async () => {
        const { data, error } = await supabase
            .from('rewards')
            .select('*')
            .order('cost', { ascending: true });

        if (error) console.error('Error fetching rewards:', error);
        else setRewards(data || []);
    };

    const addReward = async (title, cost, icon = '🎁') => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('rewards')
            .insert([{ title, cost: parseInt(cost, 10), icon, created_by: user.id }]);

        if (error) console.error('Error adding reward:', error);
    };

    const updateReward = async (id, title, cost, icon) => {
        const { error } = await supabase
            .from('rewards')
            .update({ title, cost: parseInt(cost, 10), icon })
            .eq('id', id);

        if (error) console.error('Error updating reward:', error);
    };

    const deleteReward = async (id) => {
        const { error } = await supabase
            .from('rewards')
            .delete()
            .eq('id', id);

        if (error) console.error('Error deleting reward:', error);
    };

    return {
        rewards,
        addReward,
        updateReward,
        deleteReward
    };
};
