import PDFDocument from 'pdfkit';
import supabase from '../config/database.js';
import { config } from '../config/env.js';
import * as eventService from './event.service.js';

/**
 * Get events assigned to a coordinator
 */
export const getAssignedEvents = async (coordinatorId) => {
    return eventService.getCoordinatorEvents(coordinatorId);
};

/**
 * Generate a PDF event report including:
 * - Event name, date, venue
 * - Volunteer count
 * - Attendance summary per volunteer
 * - Volunteer hours (based on duration_hours)
 */
export const generateEventReport = async (eventId) => {
    // Fetch event
    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (eventError || !event) throw new Error('Event not found');

    // Fetch registrations with profile
    const { data: registrations, error: regError } = await supabase
        .from('event_registrations')
        .select(`
      id,
      status,
      volunteer_id,
      users!event_registrations_volunteer_id_fkey (
        email,
        volunteer_profiles ( full_name )
      )
    `)
        .eq('event_id', eventId);

    if (regError) throw regError;

    // Fetch attendance records
    const { data: attendance, error: attError } = await supabase
        .from('volunteer_attendance')
        .select('volunteer_id, present, date')
        .eq('event_id', eventId);

    if (attError) throw attError;

    // Build attendance map
    const attendanceMap = {};
    for (const rec of attendance || []) {
        if (!attendanceMap[rec.volunteer_id]) {
            attendanceMap[rec.volunteer_id] = { total: 0, present: 0 };
        }
        attendanceMap[rec.volunteer_id].total += 1;
        if (rec.present) attendanceMap[rec.volunteer_id].present += 1;
    }

    // Build PDF
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(22).font('Helvetica-Bold').text(config.ngo.name, { align: 'center' });
            doc.fontSize(11).font('Helvetica').text('Event Report', { align: 'center' });
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.5);

            // Event details
            doc.fontSize(16).font('Helvetica-Bold').text(event.title);
            doc.fontSize(11).font('Helvetica');
            doc.text(`Date: ${new Date(event.event_date).toLocaleDateString('en-IN', { dateStyle: 'long' })}`);
            if (event.venue) doc.text(`Venue: ${event.venue}, ${event.city || ''}`);
            if (event.duration_hours) doc.text(`Duration: ${event.duration_hours} hour(s)`);
            doc.text(`Status: ${event.status.toUpperCase()}`);
            doc.moveDown(0.5);

            // Stats
            const totalVol = registrations?.length || 0;
            const attended = (registrations || []).filter((r) => r.status === 'attended').length;
            doc.fontSize(13).font('Helvetica-Bold').text('Summary');
            doc.fontSize(11).font('Helvetica');
            doc.text(`Total Registered Volunteers: ${totalVol}`);
            doc.text(`Attended (event_registrations): ${attended}`);
            const totalHours = (attended * (event.duration_hours || 0)).toFixed(1);
            doc.text(`Total Volunteer Hours: ${totalHours} hours`);
            doc.moveDown(0.5);

            // Volunteer table header
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.3);
            doc.fontSize(11).font('Helvetica-Bold');
            doc.text('Volunteer Name', 50, doc.y, { width: 200, continued: true });
            doc.text('Email', 250, doc.y, { width: 160, continued: true });
            doc.text('Reg. Status', 410, doc.y, { width: 80, continued: true });
            doc.text('Sessions', 490, doc.y, { width: 60 });
            doc.moveDown(0.2);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(0.2);
            doc.font('Helvetica').fontSize(10);

            for (const reg of registrations || []) {
                const name = reg.users?.volunteer_profiles?.full_name || 'Unknown';
                const email = reg.users?.email || '-';
                const sessInfo = attendanceMap[reg.volunteer_id];
                const sessions = sessInfo ? `${sessInfo.present}/${sessInfo.total}` : '-';

                doc.text(name, 50, doc.y, { width: 195, continued: true });
                doc.text(email, 250, doc.y, { width: 155, continued: true });
                doc.text(reg.status, 410, doc.y, { width: 75, continued: true });
                doc.text(sessions, 490, doc.y, { width: 60 });
            }

            doc.moveDown(1);
            doc.fontSize(9).fillColor('#888888').text(`Generated on ${new Date().toLocaleString('en-IN')} by ${config.ngo.name}`, { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};
