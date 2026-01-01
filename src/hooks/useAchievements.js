import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import confetti from 'canvas-confetti';

export const useAchievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [userAchievements, setUserAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const { data: allAchievements, error: aError } = await supabase
                .from('achievements')
                .select('*');

            if (aError) throw aError;

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: uAchievements, error: uError } = await supabase
                    .from('user_achievements')
                    .select('achievement_id, unlocked_at')
                    .eq('user_id', user.id);

                if (uError) throw uError;
                setUserAchievements(uAchievements || []);
            }

            setAchievements(allAchievements || []);
        } catch (error) {
            console.error('Error fetching achievements:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const checkAndUnlock = async (userId, type, value) => {
        const potentialUnlocks = achievements.filter(a =>
            a.requirement_type === type &&
            a.requirement_value <= value &&
            !userAchievements.find(ua => ua.achievement_id === a.id)
        );

        for (const achievement of potentialUnlocks) {
            const { error } = await supabase
                .from('user_achievements')
                .insert([{ user_id: userId, achievement_id: achievement.id }]);

            if (!error) {
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.3 },
                    colors: ['#00ff9d', '#bd00ff', '#ffcc00']
                });
                // Update local state
                setUserAchievements(prev => [...prev, { achievement_id: achievement.id, unlocked_at: new Date().toISOString() }]);
                console.log(`Unlocked achievement: ${achievement.name}`);
            }
        }
    };

    return {
        achievements,
        userAchievements,
        loading,
        checkAndUnlock,
        refresh: fetchAchievements
    };
};
