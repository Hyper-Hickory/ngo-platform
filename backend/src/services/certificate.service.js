import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import supabase from '../config/database.js';
import { config } from '../config/env.js';
import { getVolunteerEventSessionCount } from './attendance.service.js';

/**
 * Generate certificate number
 */
const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `NGO-${year}-${random}`;
};

/**
 * Create PDF certificate
 */
const createCertificatePDF = async (certificateData) => {
    const { volunteer_name, event_title, event_date, certificate_number, qr_code_url } = certificateData;

    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
            const chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Certificate border
            doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();
            doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke();

            // NGO Name (Header)
            doc.fontSize(28)
                .font('Helvetica-Bold')
                .text(config.ngo.name, 0, 80, { align: 'center' });

            doc.fontSize(14)
                .font('Helvetica')
                .text(config.ngo.tagline, 0, 115, { align: 'center' });

            // Certificate Title
            doc.fontSize(32)
                .font('Helvetica-Bold')
                .fillColor('#2563eb')
                .text('CERTIFICATE OF PARTICIPATION', 0, 180, { align: 'center' });

            // Presented to text
            doc.fontSize(16)
                .fillColor('#000000')
                .font('Helvetica')
                .text('This is to certify that', 0, 240, { align: 'center' });

            // Volunteer Name
            doc.fontSize(36)
                .font('Helvetica-Bold')
                .fillColor('#1e40af')
                .text(volunteer_name, 0, 270, { align: 'center' });

            // Event participation text
            doc.fontSize(16)
                .fillColor('#000000')
                .font('Helvetica')
                .text('has successfully participated in', 0, 330, { align: 'center' });

            // Event Name
            doc.fontSize(24)
                .font('Helvetica-Bold')
                .text(event_title, 0, 360, { align: 'center' });

            // Event Date
            const formattedDate = new Date(event_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            doc.fontSize(14)
                .font('Helvetica')
                .text(`on ${formattedDate}`, 0, 400, { align: 'center' });

            // Certificate Number
            doc.fontSize(10)
                .fillColor('#666666')
                .text(`Certificate No: ${certificate_number}`, 0, 480, { align: 'center' });

            // QR Code (if verification URL exists)
            if (qr_code_url) {
                try {
                    const qrCodeDataURL = await QRCode.toDataURL(qr_code_url);
                    const qrImageBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
                    doc.image(qrImageBuffer, doc.page.width - 130, doc.page.height - 130, {
                        width: 80,
                        height: 80,
                    });
                    doc.fontSize(8)
                        .fillColor('#666666')
                        .text('Scan to verify', doc.page.width - 130, doc.page.height - 40, {
                            width: 80,
                            align: 'center',
                        });
                } catch (qrError) {
                    console.error('QR Code generation error:', qrError);
                }
            }

            // Signature line
            doc.fontSize(12)
                .fillColor('#000000')
                .text('_______________________', 100, 500);
            doc.fontSize(10)
                .text('Authorized Signature', 100, 520);

            // Issue Date
            const issueDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            doc.fontSize(10)
                .text(`Issued on: ${issueDate}`, doc.page.width - 250, 520);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generate certificates for an event (admin only)
 */
export const generateCertificatesForEvent = async (eventId) => {
    // Get event details
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (eventError || !event) {
        throw new Error('Event not found');
    }

    // Get all attended volunteers
    const { data: attendees, error: attendeesError } = await supabase
        .from('event_registrations')
        .select(`
      id,
      volunteer_id,
      users!event_registrations_volunteer_id_fkey (
        id,
        volunteer_profiles (
          full_name
        )
      )
    `)
        .eq('event_id', eventId)
        .eq('status', 'attended');

    if (attendeesError) throw attendeesError;

    if (!attendees || attendees.length === 0) {
        throw new Error('No attendees found for this event');
    }

    const certificates = [];

    for (const attendee of attendees) {
        try {
            const volunteer_name = attendee.users.volunteer_profiles.full_name;

            // Phase 2: Gate on required_sessions attendance
            const requiredSessions = event.required_sessions || 1;
            const sessionCount = await getVolunteerEventSessionCount(attendee.volunteer_id, eventId);
            if (sessionCount < requiredSessions) {
                console.log(`Skipping ${volunteer_name}: only ${sessionCount}/${requiredSessions} sessions attended`);
                continue;
            }

            const certificate_number = generateCertificateNumber();
            const verification_url = `${config.cors.origin}/verify-certificate/${certificate_number}`;

            // Check if certificate already exists
            const { data: existing } = await supabase
                .from('certificates')
                .select('id')
                .eq('event_id', eventId)
                .eq('volunteer_id', attendee.volunteer_id)
                .single();

            if (existing) {
                console.log(`Certificate already exists for ${volunteer_name}`);
                continue;
            }

            // Generate PDF
            const pdfBuffer = await createCertificatePDF({
                volunteer_name,
                event_title: event.title,
                event_date: event.event_date,
                certificate_number,
                qr_code_url: verification_url,
            });

            // Upload to Supabase Storage
            const fileName = `${certificate_number}.pdf`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('certificates')
                .upload(fileName, pdfBuffer, {
                    contentType: 'application/pdf',
                    upsert: false,
                });

            if (uploadError) {
                console.error(`Upload error for ${volunteer_name}:`, uploadError);
                continue;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('certificates')
                .getPublicUrl(fileName);

            // Save certificate record
            const { data: certData, error: certError } = await supabase
                .from('certificates')
                .insert({
                    certificate_number,
                    event_id: eventId,
                    volunteer_id: attendee.volunteer_id,
                    volunteer_name,
                    event_title: event.title,
                    event_date: event.event_date,
                    pdf_url: urlData.publicUrl,
                    qr_code_data: verification_url,
                })
                .select()
                .single();

            if (certError) {
                console.error(`Database error for ${volunteer_name}:`, certError);
                continue;
            }

            certificates.push(certData);
        } catch (error) {
            console.error(`Error generating certificate:`, error);
        }
    }

    return {
        message: `Generated ${certificates.length} certificates`,
        certificates,
    };
};

/**
 * Get certificate by certificate number (public)
 */
export const verifyCertificate = async (certificateNumber) => {
    const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_number', certificateNumber)
        .single();

    if (error || !data) {
        throw new Error('Certificate not found or invalid');
    }

    return data;
};

/**
 * Get volunteer's certificates
 */
export const getVolunteerCertificates = async (volunteerId) => {
    const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('volunteer_id', volunteerId)
        .order('issued_date', { ascending: false });

    if (error) throw error;
    return data;
};
