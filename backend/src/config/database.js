import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

// Create Supabase client with service role key for admin operations
export const supabase = createClient(
    config.supabase.url,
    config.supabase.serviceKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Helper function to execute SQL queries
export const executeQuery = async (query, params = []) => {
    try {
        const { data, error } = await supabase.rpc(query, params);
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

export default supabase;
