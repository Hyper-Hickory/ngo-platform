import express from 'express';
import * as eventController from '../controllers/event.controller.js';
import * as validators from '../utils/validators.js';
import { validate } from '../middleware/validate.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { isAdmin, isVolunteerOrAdmin, isAdminOrCoordinator } from '../middleware/rbac.js';
import { updateEventLifecycles } from '../services/event.service.js';

const router = express.Router();

/**
 * @route GET /api/events
 * @desc Get all public events
 * @access Public
 */
router.get('/', optionalAuth, eventController.getEvents);

/**
 * @route GET /api/events/:id
 * @desc Get event by ID
 * @access Public
 */
router.get('/:id', optionalAuth, eventController.getEventById);

/**
 * @route POST /api/events
 * @desc Create new event
 * @access Private (Admin)
 */
router.post('/', authenticate, isAdmin, validate(validators.eventSchema), eventController.createEvent);

/**
 * @route PUT /api/events/:id
 * @desc Update event
 * @access Private (Admin)
 */
router.put('/:id', authenticate, isAdmin, eventController.updateEvent);

/**
 * @route DELETE /api/events/:id
 * @desc Delete event
 * @access Private (Admin)
 */
router.delete('/:id', authenticate, isAdmin, eventController.deleteEvent);

/**
 * @route POST /api/events/:id/register
 * @desc Register for event
 * @access Private (Volunteer)
 */
router.post('/:id/register', authenticate, isVolunteerOrAdmin, eventController.registerForEvent);

/**
 * @route GET /api/events/:id/registrations
 * @desc Get event registrations
 * @access Private (Admin)
 */
router.get('/:id/registrations', authenticate, isAdmin, eventController.getEventRegistrations);

/**
 * @route DELETE /api/events/registrations/:id
 * @desc Cancel event registration
 * @access Private (Volunteer)
 */
router.delete('/registrations/:id', authenticate, isVolunteerOrAdmin, eventController.cancelRegistration);

/**
 * @route PUT /api/events/registrations/:id/attendance
 * @desc Mark attendance
 * @access Private (Admin or Event Coordinator)
 */
router.put('/registrations/:id/attendance', authenticate, isAdminOrCoordinator, eventController.markAttendance);

/**
 * @route POST /api/events/attendance/bulk
 * @desc Bulk mark attendance
 * @access Private (Admin)
 */
router.post('/attendance/bulk', authenticate, isAdmin, eventController.bulkMarkAttendance);

/**
 * @route POST /api/events/lifecycle/update
 * @desc Manually trigger event lifecycle status updates
 * @access Private (Admin)
 */
router.post('/lifecycle/update', authenticate, isAdmin, async (req, res, next) => {
    try {
        const updated = await updateEventLifecycles();
        res.json({ success: true, message: `Updated ${updated} event(s)` });
    } catch (error) {
        next(error);
    }
});

export default router;
