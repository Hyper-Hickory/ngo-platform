import * as coordinatorService from '../services/coordinator.service.js';
import * as eventService from '../services/event.service.js';

/**
 * Get events assigned to the logged-in coordinator
 * GET /api/coordinator/events
 */
export const getAssignedEvents = async (req, res, next) => {
    try {
        const events = await coordinatorService.getAssignedEvents(req.user.id);
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
 * Download PDF report for an event
 * GET /api/coordinator/events/:eventId/report
 */
export const downloadEventReport = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const pdfBuffer = await coordinatorService.generateEventReport(eventId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="event-report-${eventId}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Assign a coordinator to an event
 * POST /api/coordinator/assign
 */
export const assignCoordinator = async (req, res, next) => {
    try {
        const { coordinator_id, event_id } = req.body;
        const assignment = await eventService.assignCoordinatorToEvent(
            coordinator_id,
            event_id,
            req.user.id
        );
        res.status(201).json({
            success: true,
            message: 'Coordinator assigned to event',
            assignment,
        });
    } catch (error) {
        next(error);
    }
};
