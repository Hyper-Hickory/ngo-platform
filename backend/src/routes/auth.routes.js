import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as validators from '../utils/validators.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register new volunteer
 * @access Public
 */
router.post('/register', validate(validators.registerSchema), authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', validate(validators.loginSchema), authController.login);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', authenticate, authController.getMe);

export default router;
