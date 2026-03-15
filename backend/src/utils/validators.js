import Joi from 'joi';

/**
 * Validation schemas
 */

export const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .message('Password must contain uppercase, lowercase, number, and special character'),
    full_name: Joi.string().min(2).max(255).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    date_of_birth: Joi.date().max('now').required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const eventSchema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().required(),
    event_type: Joi.string().required(),
    event_date: Joi.date().min('now').required(),
    start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
    end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
    venue: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    max_participants: Joi.number().min(1).optional(),
    registration_deadline: Joi.date().max(Joi.ref('event_date')).required(),
    // Phase 2 fields
    duration_hours: Joi.number().min(0).optional(),
    max_volunteers: Joi.number().min(1).optional(),
    recurring_type: Joi.string().valid('none', 'weekly').optional(),
    recurring_day: Joi.string().optional(),
    poster_url: Joi.string().uri().optional(),
    required_sessions: Joi.number().min(1).optional(),
    instagram_post: Joi.string().optional(),
    facebook_post: Joi.string().optional(),
    banner_image_url: Joi.string().uri().optional(),
    is_public: Joi.boolean().optional(),
});

export const attendanceSchema = Joi.object({
    volunteer_id: Joi.string().uuid().required(),
    event_id: Joi.string().uuid().required(),
    date: Joi.date().required(),
    present: Joi.boolean().required(),
});

export const profileUpdateSchema = Joi.object({
    full_name: Joi.string().min(2).max(255).optional(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).optional(),
    occupation: Joi.string().optional(),
    skills: Joi.string().optional(),
});

export const announcementSchema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    content: Joi.string().required(),
    target_audience: Joi.string().valid('all', 'volunteers', 'admins').required(),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').optional(),
    is_pinned: Joi.boolean().optional(),
    expires_at: Joi.date().min('now').optional(),
});
