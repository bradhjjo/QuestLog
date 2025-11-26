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

        // Optimistic update: Add immediately to UI
        const optimisticTodo = {
            id: `temp-${Date.now()}`,
            title,
            reward: parseInt(reward, 10) || 10,
            user_id: user.id,
            status: 'pending',
            completed_by: null,
            inserted_at: new Date().toISOString()
        };
        setTodos(prev => [optimisticTodo, ...prev]);

        // Server update
        const { error } = await supabase
            .from('todos')
            .insert([{ title, reward: parseInt(reward, 10) || 10, user_id: user.id }]);

        if (error) {
            console.error('Error adding todo:', error);
            // Rollback on error
            setTodos(prev => prev.filter(t => t.id !== optimisticTodo.id));
        }
        // Real-time will replace with actual data
    };

    const deleteTodo = async (id) => {
        // Optimistic update: Remove immediately from UI
        const previousTodos = todos;
        setTodos(prev => prev.filter(t => t.id !== id));

        // Server update
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting todo:', error);
            // Rollback on error
            setTodos(previousTodos);
        }
    };

    const toggleComplete = async (id) => {
        const todo = todos.find(t => t.id === id);
        if (!todo || todo.status === 'approved') return;

        const newStatus = todo.status === 'pending' ? 'completed' : 'pending';
        const { data: { user } } = await supabase.auth.getUser();

        // Optimistic update: Update status immediately
        setTodos(prev => prev.map(t =>
            t.id === id
                ? {
                    ...t,
                    status: newStatus,
                    completed_by: newStatus === 'completed' ? user.id : null
                }
                : t
        ));

        // Server update
        const updates = {
            status: newStatus,
            completed_by: newStatus === 'completed' ? user.id : null
        };

        const { error } = await supabase
            .from('todos')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating todo:', error);
            // Rollback on error
            setTodos(prev => prev.map(t =>
                t.id === id ? todo : t
            ));
        }
    };

    const approveTodo = async (id) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        // Optimistic update: Update status immediately
        setTodos(prev => prev.map(t =>
            t.id === id ? { ...t, status: 'approved' } : t
        ));

        // Server update
        const { error } = await supabase
            .from('todos')
            .update({ status: 'approved' })
            .eq('id', id);

        if (error) {
            console.error('Error approving todo:', error);
            // Rollback on error
            setTodos(prev => prev.map(t =>
                t.id === id ? todo : t
            ));
        }
    };

    return {
        todos,
        addTodo,
        deleteTodo,
        toggleComplete,
        approveTodo
    };
};
