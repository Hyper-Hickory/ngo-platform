import express from 'express';
import * as announcementController from '../controllers/announcement.controller.js';
import * as validators from '../utils/validators.js';
import { validate } from '../middleware/validate.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/rbac.js';

const router = express.Router();

/**
 * @route GET /api/announcements
 * @desc Get announcements (filtered by role)
 * @access Public/Private
 */
router.get('/', optionalAuth, announcementController.getAnnouncements);

/**
 * @route POST /api/announcements
 * @desc Create announcement
 * @access Private (Admin)
 */
router.post(
    '/',
    authenticate,
    isAdmin,
    validate(validators.announcementSchema),
    announcementController.createAnnouncement
);

/**
 * @route PUT /api/announcements/:id
 * @desc Update announcement
 * @access Private (Admin)
 */
router.put('/:id', authenticate, isAdmin, announcementController.updateAnnouncement);

/**
 * @route DELETE /api/announcements/:id
 * @desc Delete announcement
 * @access Private (Admin)
 */
router.delete('/:id', authenticate, isAdmin, announcementController.deleteAnnouncement);

export default router;
