import supabase from '../config/database.js';

/**
 * Create announcement (admin only)
 */
export const createAnnouncement = async (announcementData, createdBy) => {
    const { data, error } = await supabase
        .from('announcements')
        .insert({
            ...announcementData,
            created_by: createdBy,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get announcements filtered by user role
 */
export const getAnnouncements = async (userRole) => {
    let query = supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    // Filter by target audience
    if (userRole === 'volunteer') {
        query = query.in('target_audience', ['all', 'volunteers']);
    } else if (userRole === 'admin') {
        query = query.in('target_audience', ['all', 'admins']);
    } else {
        query = query.eq('target_audience', 'all');
    }

    // Filter out expired announcements
    const now = new Date().toISOString();
    query = query.or(`expires_at.is.null,expires_at.gte.${now}`);

    const { data, error } = await query;

    if (error) throw error;
    return data;
};

/**
 * Update announcement (admin only)
 */
export const updateAnnouncement = async (announcementId, updates) => {
    const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', announcementId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Delete announcement (admin only)
 */
export const deleteAnnouncement = async (announcementId) => {
    const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId);

    if (error) throw error;
    return { message: 'Announcement deleted successfully' };
};
