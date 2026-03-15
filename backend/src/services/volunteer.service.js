import supabase from '../config/database.js';

/**
 * Get volunteer profile
 */
export const getVolunteerProfile = async (userId) => {
    const { data, error } = await supabase
        .from('volunteer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Update volunteer profile
 */
export const updateVolunteerProfile = async (userId, updates) => {
    const { data, error } = await supabase
        .from('volunteer_profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get all pending volunteers (admin)
 */
export const getPendingVolunteers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select(`
      id,
      email,
      created_at,
      volunteer_profiles (
        full_name,
        phone,
        city,
        state
      )
    `)
        .eq('role', 'volunteer')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Approve volunteer (admin)
 */
export const approveVolunteer = async (volunteerId) => {
    const { data, error } = await supabase
        .from('users')
        .update({ is_approved: true, updated_at: new Date().toISOString() })
        .eq('id', volunteerId)
        .eq('role', 'volunteer')
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get all approved volunteers (admin)
 */
export const getAllVolunteers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select(`
      id,
      email,
      is_active,
      created_at,
      volunteer_profiles (
        full_name,
        phone,
        city,
        state,
        occupation
      )
    `)
        .eq('role', 'volunteer')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Get volunteer's registered events
 */
export const getVolunteerEvents = async (userId) => {
    const { data, error } = await supabase
        .from('event_registrations')
        .select(`
      id,
      status,
      registration_date,
      events (
        id,
        title,
        description,
        event_date,
        venue,
        city,
        status
      )
    `)
        .eq('volunteer_id', userId)
        .order('registration_date', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Get volunteer's certificates
 */
export const getVolunteerCertificates = async (userId) => {
    const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('volunteer_id', userId)
        .order('issued_date', { ascending: false });

    if (error) throw error;
    return data;
};
