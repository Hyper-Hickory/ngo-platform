import supabase from '../config/database.js';

/**
 * Compute event lifecycle status based on event_date and duration_hours.
 * Returns: 'upcoming' | 'ongoing' | 'completed'
 */
const computeStatus = (event) => {
    const now = new Date();
    const eventStart = new Date(`${event.event_date}T${event.start_time || '00:00:00'}`);
    const durationMs = (event.duration_hours || 0) * 60 * 60 * 1000;
    const eventEnd = new Date(eventStart.getTime() + durationMs);

    if (now < eventStart) return 'upcoming';
    if (now >= eventStart && now < eventEnd) return 'ongoing';
    return 'completed';
};

/**
 * Update all non-cancelled events' statuses based on current time.
 * Called on server startup and via manual trigger endpoint.
 */
export const updateEventLifecycles = async () => {
    const { data: events, error } = await supabase
        .from('events')
        .select('id, event_date, start_time, duration_hours, status')
        .neq('status', 'cancelled');

    if (error) {
        console.error('Lifecycle update error:', error);
        return;
    }

    const updates = [];
    for (const event of events) {
        const newStatus = computeStatus(event);
        if (newStatus !== event.status) {
            updates.push({ id: event.id, status: newStatus });
        }
    }

    for (const { id, status } of updates) {
        await supabase
            .from('events')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);
    }

    console.log(`🕐 Lifecycle: updated ${updates.length} event(s)`);
    return updates.length;
};

/**
 * Create a new event (admin or coordinator)
 */
export const createEvent = async (eventData, createdBy) => {
    const { data, error } = await supabase
        .from('events')
        .insert({
            ...eventData,
            created_by: createdBy,
            status: 'upcoming',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get all public events with registration count
 */
export const getPublicEvents = async (filters = {}) => {
    let query = supabase
        .from('events')
        .select(`
      *,
      event_registrations(count)
    `)
        .eq('is_public', true);

    if (filters.status) {
        query = query.eq('status', filters.status);
    }

    if (filters.upcoming) {
        query = query.gte('event_date', new Date().toISOString().split('T')[0]);
    }

    if (filters.limit) {
        query = query.limit(parseInt(filters.limit));
    }

    const { data, error } = await query.order('event_date', { ascending: true });

    if (error) throw error;

    // Attach helper field: is_full
    return (data || []).map((ev) => {
        const regCount = ev.event_registrations?.[0]?.count ?? 0;
        return {
            ...ev,
            registration_count: regCount,
            is_full: ev.max_volunteers ? regCount >= ev.max_volunteers : false,
        };
    });
};

/**
 * Get event by ID (with registration count)
 */
export const getEventById = async (eventId) => {
    const { data, error } = await supabase
        .from('events')
        .select(`
      *,
      event_registrations(count)
    `)
        .eq('id', eventId)
        .single();

    if (error) throw error;

    const regCount = data.event_registrations?.[0]?.count ?? 0;
    return {
        ...data,
        registration_count: regCount,
        is_full: data.max_volunteers ? regCount >= data.max_volunteers : false,
    };
};

/**
 * Update event (admin)
 */
export const updateEvent = async (eventId, updates) => {
    const { data, error } = await supabase
        .from('events')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Delete event (admin)
 */
export const deleteEvent = async (eventId) => {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

    if (error) throw error;
    return { message: 'Event deleted successfully' };
};

/**
 * Register volunteer for event (checks max_volunteers)
 */
export const registerForEvent = async (eventId, volunteerId) => {
    const event = await getEventById(eventId);

    if (event.status === 'completed' || event.status === 'cancelled') {
        throw new Error('This event is no longer accepting registrations');
    }

    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
        throw new Error('Registration deadline has passed');
    }

    // Check if already registered
    const { data: existing } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('volunteer_id', volunteerId)
        .single();

    if (existing) {
        throw new Error('You are already registered for this event');
    }

    // Check max_volunteers (Phase 2 field — takes precedence)
    if (event.max_volunteers) {
        const { count } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .in('status', ['registered', 'attended']);

        if (count >= event.max_volunteers) {
            throw new Error('Event has reached maximum volunteer capacity');
        }
    } else if (event.max_participants) {
        // Fallback to legacy field
        const { count } = await supabase
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .in('status', ['registered', 'attended']);

        if (count >= event.max_participants) {
            throw new Error('Event has reached maximum capacity');
        }
    }

    const { data, error } = await supabase
        .from('event_registrations')
        .insert({
            event_id: eventId,
            volunteer_id: volunteerId,
            status: 'registered',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Cancel event registration
 */
export const cancelRegistration = async (registrationId, volunteerId) => {
    const { data, error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('id', registrationId)
        .eq('volunteer_id', volunteerId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Get event registrations (admin/coordinator)
 */
export const getEventRegistrations = async (eventId) => {
    const { data, error } = await supabase
        .from('event_registrations')
        .select(`
      id,
      status,
      registration_date,
      attendance_marked_at,
      volunteer_id,
      users!event_registrations_volunteer_id_fkey (
        id,
        email,
        volunteer_profiles (
          full_name,
          phone,
          city
        )
      )
    `)
        .eq('event_id', eventId)
        .order('registration_date', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Mark attendance (admin/coordinator via registrations table)
 */
export const markAttendance = async (registrationId, markedBy) => {
    const { data, error } = await supabase
        .from('event_registrations')
        .update({
            status: 'attended',
            attendance_marked_at: new Date().toISOString(),
            attendance_marked_by: markedBy,
        })
        .eq('id', registrationId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Bulk mark attendance (admin)
 */
export const bulkMarkAttendance = async (registrationIds, markedBy) => {
    const { data, error } = await supabase
        .from('event_registrations')
        .update({
            status: 'attended',
            attendance_marked_at: new Date().toISOString(),
            attendance_marked_by: markedBy,
        })
        .in('id', registrationIds)
        .select();

    if (error) throw error;
    return data;
};

/**
 * Get events assigned to a coordinator
 */
export const getCoordinatorEvents = async (coordinatorId) => {
    const { data, error } = await supabase
        .from('coordinator_event_assignments')
        .select(`
      id,
      assigned_at,
      events (*)
    `)
        .eq('coordinator_id', coordinatorId)
        .order('assigned_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => row.events);
};

/**
 * Assign a coordinator to an event (admin)
 */
export const assignCoordinatorToEvent = async (coordinatorId, eventId, assignedBy) => {
    const { data, error } = await supabase
        .from('coordinator_event_assignments')
        .insert({ coordinator_id: coordinatorId, event_id: eventId, assigned_by: assignedBy })
        .select()
        .single();

    if (error) throw error;
    return data;
};
