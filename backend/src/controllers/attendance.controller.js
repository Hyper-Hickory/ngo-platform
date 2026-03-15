import * as attendanceService from '../services/attendance.service.js';

/**
 * Mark or update attendance for a volunteer
 * POST /api/attendance
 */
export const markAttendance = async (req, res, next) => {
    try {
        const { volunteer_id, event_id, date, present } = req.body;
        const record = await attendanceService.markAttendance({
            volunteer_id,
            event_id,
            date,
            present,
            marked_by: req.user.id,
        });
        res.status(201).json({
            success: true,
            message: 'Attendance recorded',
            record,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all attendance records for an event
 * GET /api/attendance/event/:eventId
 */
export const getAttendanceForEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const records = await attendanceService.getAttendanceForEvent(eventId);
        res.json({
            success: true,
            count: records.length,
            records,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get attendance summary for a volunteer on an event
 * GET /api/attendance/volunteer/:volunteerId/event/:eventId
 */
export const getVolunteerAttendanceSummary = async (req, res, next) => {
    try {
        const { volunteerId, eventId } = req.params;
        const summary = await attendanceService.getVolunteerAttendanceSummary(volunteerId, eventId);
        res.json({
            success: true,
            summary,
        });
    } catch (error) {
        next(error);
    }
};
