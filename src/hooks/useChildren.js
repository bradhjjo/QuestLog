import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useChildren = () => {
    const [children, setChildren] = useState([]);

    useEffect(() => {
        fetchChildren();

        const channel = supabase
            .channel('public:profiles')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
                fetchChildren();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchChildren = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, xp, role')
            .eq('role', 'teen')
            .order('email', { ascending: true });

        if (error) console.error('Error fetching children:', error);
        else setChildren(data || []);
    };

    return { children };
};
