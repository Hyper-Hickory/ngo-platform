import express from 'express';
import * as attendanceController from '../controllers/attendance.controller.js';
import { attendanceSchema } from '../utils/validators.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { isAdminOrCoordinator } from '../middleware/rbac.js';

const router = express.Router();

/**
 * @route POST /api/attendance
 * @desc Mark (or update) volunteer attendance for a session
 * @access Private (Admin or Event Coordinator)
 */
router.post(
    '/',
    authenticate,
    isAdminOrCoordinator,
    validate(attendanceSchema),
    attendanceController.markAttendance
);

/**
 * @route GET /api/attendance/event/:eventId
 * @desc Get all attendance records for an event
 * @access Private (Admin or Event Coordinator)
 */
router.get(
    '/event/:eventId',
    authenticate,
    isAdminOrCoordinator,
    attendanceController.getAttendanceForEvent
);

/**
 * @route GET /api/attendance/volunteer/:volunteerId/event/:eventId
 * @desc Get attendance summary for a volunteer on a specific event
 * @access Private (Admin or Event Coordinator)
 */
router.get(
    '/volunteer/:volunteerId/event/:eventId',
    authenticate,
    isAdminOrCoordinator,
    attendanceController.getVolunteerAttendanceSummary
);

export default router;
