import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please login.',
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyToken(token);

        // Attach user info to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            isApproved: decoded.isApproved,
        };

        // Check if user is approved (except for admin)
        if (req.user.role !== 'admin' && !req.user.isApproved) {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending approval. Please contact admin.',
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.',
        });
    }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);

            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                isApproved: decoded.isApproved,
            };
        }
    } catch (error) {
        // Silently fail for optional auth
    }

    next();
};
