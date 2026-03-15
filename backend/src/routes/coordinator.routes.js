import express from 'express';
import * as coordinatorController from '../controllers/coordinator.controller.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin, isAdminOrCoordinator } from '../middleware/rbac.js';

const router = express.Router();

/**
 * @route GET /api/coordinator/events
 * @desc Get events assigned to the logged-in coordinator
 * @access Private (Admin or Event Coordinator)
 */
router.get('/events', authenticate, isAdminOrCoordinator, coordinatorController.getAssignedEvents);

/**
 * @route GET /api/coordinator/events/:eventId/report
 * @desc Download PDF report for an event
 * @access Private (Admin or Event Coordinator)
 */
router.get(
    '/events/:eventId/report',
    authenticate,
    isAdminOrCoordinator,
    coordinatorController.downloadEventReport
);

/**
 * @route POST /api/coordinator/assign
 * @desc Assign a coordinator to an event (admin only)
 * @access Private (Admin)
 */
router.post('/assign', authenticate, isAdmin, coordinatorController.assignCoordinator);

export default router;
