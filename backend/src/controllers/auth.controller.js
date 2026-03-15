import * as authService from '../services/auth.service.js';

/**
 * Register volunteer
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
    try {
        const result = await authService.registerVolunteer(req.body);
        res.status(201).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);

        res.json({
            success: true,
            message: 'Login successful',
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
    try {
        const user = await authService.getCurrentUser(req.user.id, req.user.role);
        res.json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};
