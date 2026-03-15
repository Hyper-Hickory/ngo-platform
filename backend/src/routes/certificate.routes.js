import express from 'express';
import * as certificateController from '../controllers/certificate.controller.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin, isVolunteerOrAdmin } from '../middleware/rbac.js';

const router = express.Router();

/**
 * @route POST /api/certificates/generate/:eventId
 * @desc Generate certificates for event
 * @access Private (Admin)
 */
router.post('/generate/:eventId', authenticate, isAdmin, certificateController.generateCertificates);

/**
 * @route GET /api/certificates/verify/:certificateNumber
 * @desc Verify certificate (public)
 * @access Public
 */
router.get('/verify/:certificateNumber', certificateController.verifyCertificate);

/**
 * @route GET /api/certificates/volunteer
 * @desc Get volunteer's certificates
 * @access Private (Volunteer)
 */
router.get('/volunteer', authenticate, isVolunteerOrAdmin, certificateController.getVolunteerCertificates);

export default router;
