import * as announcementService from '../services/announcement.service.js';

/**
 * Create announcement (admin)
 * POST /api/announcements
 */
export const createAnnouncement = async (req, res, next) => {
    try {
        const announcement = await announcementService.createAnnouncement(req.body, req.user.id);
        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            announcement,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get announcements
 * GET /api/announcements
 */
export const getAnnouncements = async (req, res, next) => {
    try {
        const announcements = await announcementService.getAnnouncements(req.user?.role || 'public');
        res.json({
            success: true,
            count: announcements.length,
            announcements,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update announcement (admin)
 * PUT /api/announcements/:id
 */
export const updateAnnouncement = async (req, res, next) => {
    try {
        const { id } = req.params;
        const announcement = await announcementService.updateAnnouncement(id, req.body);
        res.json({
            success: true,
            message: 'Announcement updated successfully',
            announcement,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete announcement (admin)
 * DELETE /api/announcements/:id
 */
export const deleteAnnouncement = async (req, res, next) => {
    try {
        const { id } = req.params;
        await announcementService.deleteAnnouncement(id);
        res.json({
            success: true,
            message: 'Announcement deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
