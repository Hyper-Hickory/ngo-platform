import * as certificateService from '../services/certificate.service.js';

/**
 * Generate certificates for event (admin)
 * POST /api/certificates/generate/:eventId
 */
export const generateCertificates = async (req, res, next) => {
    try {
        const { eventId } = req.params;
        const result = await certificateService.generateCertificatesForEvent(eventId);
        res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify certificate (public)
 * GET /api/certificates/verify/:certificateNumber
 */
export const verifyCertificate = async (req, res, next) => {
    try {
        const { certificateNumber } = req.params;
        const certificate = await certificateService.verifyCertificate(certificateNumber);
        res.json({
            success: true,
            certificate,
            message: 'Certificate is valid',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get volunteer certificates
 * GET /api/certificates/volunteer
 */
export const getVolunteerCertificates = async (req, res, next) => {
    try {
        const certificates = await certificateService.getVolunteerCertificates(req.user.id);
        res.json({
            success: true,
            count: certificates.length,
            certificates,
        });
    } catch (error) {
        next(error);
    }
};
