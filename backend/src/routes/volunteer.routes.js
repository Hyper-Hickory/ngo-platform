import express from 'express';
import * as volunteerController from '../controllers/volunteer.controller.js';
import * as validators from '../utils/validators.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin, isVolunteerOrAdmin } from '../middleware/rbac.js';

const router = express.Router();

/**
 * @route GET /api/volunteers/profile
 * @desc Get own profile
 * @access Private (Volunteer)
 */
router.get('/profile', authenticate, isVolunteerOrAdmin, volunteerController.getProfile);

/**
 * @route PUT /api/volunteers/profile
 * @desc Update own profile
 * @access Private (Volunteer)
 */
router.put(
    '/profile',
    authenticate,
    isVolunteerOrAdmin,
    validate(validators.profileUpdateSchema),
    volunteerController.updateProfile
);

/**
 * @route GET /api/volunteers/events
 * @desc Get volunteer's registered events
 * @access Private (Volunteer)
 */
router.get('/events', authenticate, isVolunteerOrAdmin, volunteerController.getMyEvents);

/**
 * @route GET /api/volunteers/certificates
 * @desc Get volunteer's certificates
 * @access Private (Volunteer)
 */
router.get('/certificates', authenticate, isVolunteerOrAdmin, volunteerController.getMyCertificates);

/**
 * @route GET /api/volunteers/pending
 * @desc Get pending volunteers
 * @access Private (Admin)
 */
router.get('/pending', authenticate, isAdmin, volunteerController.getPendingVolunteers);

/**
 * @route PUT /api/volunteers/:id/approve
 * @desc Approve volunteer
 * @access Private (Admin)
 */
router.put('/:id/approve', authenticate, isAdmin, volunteerController.approveVolunteer);

/**
 * @route GET /api/volunteers
 * @desc Get all approved volunteers
 * @access Private (Admin)
 */
router.get('/', authenticate, isAdmin, volunteerController.getAllVolunteers);

export default router;
