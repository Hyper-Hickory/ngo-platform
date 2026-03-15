import * as eventService from '../services/event.service.js';

/**
 * Create event (admin)
 * POST /api/events
 */
export const createEvent = async (req, res, next) => {
    try {
        const event = await eventService.createEvent(req.body, req.user.id);
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all events (public or filtered)
 * GET /api/events
 */
export const getEvents = async (req, res, next) => {
    try {
        const { status, upcoming } = req.query;
        const events = await eventService.getPublicEvents({
            status,
            upcoming: upcoming === 'true',
        });
        res.json({
            success: true,
            count: events.length,
            events,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get event by ID
 * GET /api/events/:id
 */
export const getEventById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await eventService.getEventById(id);
        res.json({
            success: true,
            event,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update event (admin)
 * PUT /api/events/:id
 */
export const updateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await eventService.updateEvent(id, req.body);
        res.json({
            success: true,
            message: 'Event updated successfully',
            event,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete event (admin)
 * DELETE /api/events/:id
 */
export const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        await eventService.deleteEvent(id);
        res.json({
            success: true,
            message: 'Event deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Register for event (volunteer)
 * POST /api/events/:id/register
 */
export const registerForEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const registration = await eventService.registerForEvent(id, req.user.id);
        res.status(201).json({
            success: true,
            message: 'Successfully registered for event',
            registration,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel registration (volunteer)
 * DELETE /api/events/registrations/:id
 */
export const cancelRegistration = async (req, res, next) => {
    try {
        const { id } = req.params;
        await eventService.cancelRegistration(id, req.user.id);
        res.json({
            success: true,
            message: 'Registration cancelled successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get event registrations (admin)
 * GET /api/events/:id/registrations
 */
export const getEventRegistrations = async (req, res, next) => {
    try {
        const { id } = req.params;
        const registrations = await eventService.getEventRegistrations(id);
        res.json({
            success: true,
            count: registrations.length,
            registrations,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Mark attendance (admin)
 * PUT /api/events/registrations/:id/attendance
 */
export const markAttendance = async (req, res, next) => {
    try {
        const { id } = req.params;
        const registration = await eventService.markAttendance(id, req.user.id);
        res.json({
            success: true,
            message: 'Attendance marked successfully',
            registration,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Bulk mark attendance (admin)
 * POST /api/events/attendance/bulk
 */
export const bulkMarkAttendance = async (req, res, next) => {
    try {
        const { registration_ids } = req.body;
        const registrations = await eventService.bulkMarkAttendance(registration_ids, req.user.id);
        res.json({
            success: true,
            message: `Marked attendance for ${registrations.length} volunteers`,
            registrations,
        });
    } catch (error) {
        next(error);
    }
};
