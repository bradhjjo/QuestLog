import { supabase } from '../supabaseClient';

const LAST_RESET_KEY = 'daily_quest_last_reset';

// Check if we need to reset daily quests
export const checkDailyQuestReset = async () => {
    const lastReset = localStorage.getItem(LAST_RESET_KEY);
    const now = new Date();

    // Get today's 6 AM
    const today6AM = new Date(now);
    today6AM.setHours(6, 0, 0, 0);

    // If current time is before 6 AM, use yesterday's 6 AM as the reset point
    if (now.getHours() < 6) {
        today6AM.setDate(today6AM.getDate() - 1);
    }

    // Check if we need to reset
    const shouldReset = !lastReset || new Date(lastReset) < today6AM;

    if (shouldReset) {
        await resetDailyQuests();
        localStorage.setItem(LAST_RESET_KEY, now.toISOString());
    }
};

// Reset all daily quests
const resetDailyQuests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all daily quest templates (approved daily quests)
    const { data: templates, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_daily', true)
        .eq('status', 'approved');

    if (fetchError) {
        console.error('Error fetching daily quest templates:', fetchError);
        return;
    }

    if (!templates || templates.length === 0) return;

    // Delete old daily quests (pending or completed)
    const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('user_id', user.id)
        .eq('is_daily', true)
        .in('status', ['pending', 'completed']);

    if (deleteError) {
        console.error('Error deleting old daily quests:', deleteError);
        return;
    }

    // Create new daily quests from templates
    const newQuests = templates.map(template => ({
        title: template.title,
        reward: template.reward,
        user_id: template.user_id,
        is_daily: true,
        status: 'pending',
        completed_by: null
    }));

    const { error: insertError } = await supabase
        .from('todos')
        .insert(newQuests);

    if (insertError) {
        console.error('Error creating new daily quests:', insertError);
        return;
    }

    console.log(`✅ Daily quests reset! Created ${newQuests.length} new quests.`);
};
