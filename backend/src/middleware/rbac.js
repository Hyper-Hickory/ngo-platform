/**
 * Role-based access control middleware
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 */
export const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource',
            });
        }

        next();
    };
};

/**
 * Check if user is admin
 */
export const isAdmin = authorize(['admin']);

/**
 * Check if user is volunteer or admin
 */
export const isVolunteerOrAdmin = authorize(['volunteer', 'admin']);

/**
 * Check if user is event coordinator
 */
export const isCoordinator = authorize(['event_coordinator']);

/**
 * Check if user is admin or event coordinator
 */
export const isAdminOrCoordinator = authorize(['admin', 'event_coordinator']);

/**
 * Check if user is volunteer, admin, or coordinator
 */
export const isAnyRole = authorize(['volunteer', 'admin', 'event_coordinator']);
