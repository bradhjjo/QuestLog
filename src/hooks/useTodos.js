import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useTodos = () => {
    const [todos, setTodos] = useState([]);

    useEffect(() => {
        fetchTodos();

        const channel = supabase
            .channel('public:todos')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, (payload) => {
                fetchTodos();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchTodos = async () => {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('inserted_at', { ascending: false });

        if (error) console.error('Error fetching todos:', error);
        else setTodos(data || []);
    };

    const addTodo = async (title, reward) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('todos')
            .insert([{ title, reward: parseInt(reward, 10) || 10, user_id: user.id }]);

        if (error) console.error('Error adding todo:', error);
    };

    const deleteTodo = async (id) => {
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);

        if (error) console.error('Error deleting todo:', error);
    };

    const toggleComplete = async (id) => {
        const todo = todos.find(t => t.id === id);
        if (!todo || todo.status === 'approved') return;

        const newStatus = todo.status === 'pending' ? 'completed' : 'pending';
        const { data: { user } } = await supabase.auth.getUser();

        // If completing, set completed_by to current user. If undoing, set to null.
        const updates = {
            status: newStatus,
            completed_by: newStatus === 'completed' ? user.id : null
        };

        const { error } = await supabase
            .from('todos')
            .update(updates)
            .eq('id', id);

        if (error) console.error('Error updating todo:', error);
    };

    const approveTodo = async (id) => {
        const { error } = await supabase
            .from('todos')
            .update({ status: 'approved' })
            .eq('id', id);

        if (error) console.error('Error approving todo:', error);
    };

    return {
        todos,
        addTodo,
        deleteTodo,
        toggleComplete,
        approveTodo
    };
};
