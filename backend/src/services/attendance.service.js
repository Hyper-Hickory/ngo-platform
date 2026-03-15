import supabase from '../config/database.js';

/**
 * Mark attendance for a volunteer in an event session
 */
export const markAttendance = async ({ volunteer_id, event_id, date, present, marked_by }) => {
    const { data, error } = await supabase
        .from('volunteer_attendance')
        .upsert(
            { volunteer_id, event_id, date, present, marked_by },
            { onConflict: 'volunteer_id,event_id,date' }
        )
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get all attendance records for an event
 */
export const getAttendanceForEvent = async (eventId) => {
    const { data, error } = await supabase
        .from('volunteer_attendance')
        .select(`
      id,
      date,
      present,
      marked_by,
      created_at,
      volunteer_id,
      users!volunteer_attendance_volunteer_id_fkey (
        id,
        email,
        volunteer_profiles (
          full_name,
          phone
        )
      )
    `)
        .eq('event_id', eventId)
        .order('date', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Get attendance summary for a volunteer on a specific event.
 * Returns session count and list of dates attended.
 */
export const getVolunteerAttendanceSummary = async (volunteerId, eventId) => {
    const { data, error } = await supabase
        .from('volunteer_attendance')
        .select('id, date, present')
        .eq('volunteer_id', volunteerId)
        .eq('event_id', eventId)
        .order('date', { ascending: true });

    if (error) throw error;

    const sessions_attended = (data || []).filter((r) => r.present).length;
    const sessions_total = (data || []).length;

    return { sessions_attended, sessions_total, records: data };
};

/**
 * Get attendance count for a volunteer across a specific event (for certificate gating)
 */
export const getVolunteerEventSessionCount = async (volunteerId, eventId) => {
    const { count, error } = await supabase
        .from('volunteer_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('volunteer_id', volunteerId)
        .eq('event_id', eventId)
        .eq('present', true);

    if (error) throw error;
    return count || 0;
};
