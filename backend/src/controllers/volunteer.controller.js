import * as volunteerService from '../services/volunteer.service.js';

/**
 * Get volunteer profile
 * GET /api/volunteers/profile
 */
export const getProfile = async (req, res, next) => {
    try {
        const profile = await volunteerService.getVolunteerProfile(req.user.id);
        res.json({
            success: true,
            profile,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update volunteer profile
 * PUT /api/volunteers/profile
 */
export const updateProfile = async (req, res, next) => {
    try {
        const profile = await volunteerService.updateVolunteerProfile(req.user.id, req.body);
        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get pending volunteers (admin)
 * GET /api/volunteers/pending
 */
export const getPendingVolunteers = async (req, res, next) => {
    try {
        const volunteers = await volunteerService.getPendingVolunteers();
        res.json({
            success: true,
            count: volunteers.length,
            volunteers,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Approve volunteer (admin)
 * PUT /api/volunteers/:id/approve
 */
export const approveVolunteer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const volunteer = await volunteerService.approveVolunteer(id);
        res.json({
            success: true,
            message: 'Volunteer approved successfully',
            volunteer,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all volunteers (admin)
 * GET /api/volunteers
 */
export const getAllVolunteers = async (req, res, next) => {
    try {
        const volunteers = await volunteerService.getAllVolunteers();
        res.json({
            success: true,
            count: volunteers.length,
            volunteers,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get volunteer's events
 * GET /api/volunteers/events
 */
export const getMyEvents = async (req, res, next) => {
    try {
        const events = await volunteerService.getVolunteerEvents(req.user.id);
        res.json({
            success: true,
            count: events.length,
            events,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get volunteer's certificates
 * GET /api/volunteers/certificates
 */
export const getMyCertificates = async (req, res, next) => {
    try {
        const certificates = await volunteerService.getVolunteerCertificates(req.user.id);
        res.json({
            success: true,
            count: certificates.length,
            certificates,
        });
    } catch (error) {
        next(error);
    }
};
