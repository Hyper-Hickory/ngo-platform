import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/event.service';
import { volunteerService } from '../../services/volunteer.service';
import { certificateService } from '../../services/certificate.service';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [events, setEvents] = useState([]);
    const [pendingVolunteers, setPendingVolunteers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Event form state
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventFormData, setEventFormData] = useState({
        title: '',
        description: '',
        event_type: '',
        event_date: '',
        start_time: '',
        end_time: '',
        venue: '',
        city: '',
        state: '',
        max_participants: '',
        registration_deadline: '',
        // Phase 2 fields
        duration_hours: '',
        max_volunteers: '',
        recurring_type: 'none',
        recurring_day: '',
        poster_url: '',
        required_sessions: '1',
    });

    // Selected event for operations
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventRegistrations, setEventRegistrations] = useState([]);

    useEffect(() => {
        loadEvents();
        loadPendingVolunteers();
    }, []);

    const loadEvents = async () => {
        try {
            const response = await eventService.getAll();
            setEvents(response.events || []);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    };

    const loadPendingVolunteers = async () => {
        try {
            const response = await volunteerService.getPending();
            setPendingVolunteers(response.volunteers || []);
        } catch (error) {
            console.error('Error loading pending volunteers:', error);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await eventService.create(eventFormData);
            setMessage('Event created successfully!');
            setShowEventForm(false);
            setEventFormData({
                title: '',
                description: '',
                event_type: '',
                event_date: '',
                start_time: '',
                end_time: '',
                venue: '',
                city: '',
                state: '',
                max_participants: '',
                registration_deadline: '',
                duration_hours: '',
                max_volunteers: '',
                recurring_type: 'none',
                recurring_day: '',
                poster_url: '',
                required_sessions: '1',
            });
            loadEvents();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error creating event: ' + (error.message || 'Unknown error'));
        }
        setLoading(false);
    };

    const handleApproveVolunteer = async (volunteerId) => {
        try {
            await volunteerService.approve(volunteerId);
            setMessage('Volunteer approved successfully!');
            loadPendingVolunteers();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error approving volunteer');
        }
    };

    const handleGenerateCertificates = async (eventId) => {
        if (!confirm('Generate certificates for all attendees of this event?')) return;

        setLoading(true);
        try {
            const response = await certificateService.generate(eventId);
            setMessage(response.message || 'Certificates generated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error generating certificates: ' + (error.message || 'Unknown error'));
        }
        setLoading(false);
    };

    const loadEventRegistrations = async (eventId) => {
        try {
            const response = await eventService.getRegistrations(eventId);
            setEventRegistrations(response.registrations || []);
            setSelectedEvent(eventId);
        } catch (error) {
            console.error('Error loading registrations:', error);
        }
    };

    const handleMarkAttendance = async (registrationId) => {
        try {
            await eventService.markAttendance(registrationId);
            setMessage('Attendance marked successfully!');
            loadEventRegistrations(selectedEvent);
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error marking attendance');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-600">Welcome, {user.email}</p>
                    </div>
                    <button onClick={logout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>
            </header>

            {/* Message */}
            {message && (
                <div className="max-w-7xl mx-auto px-4 mt-4">
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        {message}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 mt-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {['overview', 'events', 'volunteers', 'attendance', 'certificates'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                        ? 'border-primary-600 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-2">Total Events</h3>
                            <p className="text-3xl font-bold text-primary-600">{events.length}</p>
                        </div>
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-2">Pending Approvals</h3>
                            <p className="text-3xl font-bold text-yellow-600">{pendingVolunteers.length}</p>
                        </div>
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
                            <button onClick={() => { setActiveTab('events'); setShowEventForm(true); }} className="btn btn-primary w-full">
                                Create Event
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'events' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Events</h2>
                            <button onClick={() => setShowEventForm(!showEventForm)} className="btn btn-primary">
                                {showEventForm ? 'Cancel' : 'Create Event'}
                            </button>
                        </div>

                        {showEventForm && (
                            <div className="card mb-6">
                                <h3 className="text-lg font-semibold mb-4">Create New Event</h3>
                                <form onSubmit={handleCreateEvent} className="grid md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Title *</label>
                                        <input type="text" className="input" value={eventFormData.title} onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })} required />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Description *</label>
                                        <textarea className="input" rows="3" value={eventFormData.description} onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Event Type *</label>
                                        <input type="text" className="input" value={eventFormData.event_type} onChange={(e) => setEventFormData({ ...eventFormData, event_type: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Event Date *</label>
                                        <input type="date" className="input" value={eventFormData.event_date} onChange={(e) => setEventFormData({ ...eventFormData, event_date: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Start Time *</label>
                                        <input type="time" className="input" value={eventFormData.start_time} onChange={(e) => setEventFormData({ ...eventFormData, start_time: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">End Time *</label>
                                        <input type="time" className="input" value={eventFormData.end_time} onChange={(e) => setEventFormData({ ...eventFormData, end_time: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Venue *</label>
                                        <input type="text" className="input" value={eventFormData.venue} onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">City *</label>
                                        <input type="text" className="input" value={eventFormData.city} onChange={(e) => setEventFormData({ ...eventFormData, city: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">State *</label>
                                        <input type="text" className="input" value={eventFormData.state} onChange={(e) => setEventFormData({ ...eventFormData, state: e.target.value })} required />
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium mb-2">Max Participants</label>
                                        <input type="number" className="input" value={eventFormData.max_participants} onChange={(e) => setEventFormData({ ...eventFormData, max_participants: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-2">Registration Deadline *</label>
                                        <input type="date" className="input" value={eventFormData.registration_deadline} onChange={(e) => setEventFormData({ ...eventFormData, registration_deadline: e.target.value })} required />
                                    </div>
                                    {/* ─── Phase 2 Fields ─── */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Max Volunteers (Volunteer Limit)</label>
                                        <input type="number" min="1" className="input" value={eventFormData.max_volunteers} onChange={(e) => setEventFormData({ ...eventFormData, max_volunteers: e.target.value })} placeholder="Leave blank for unlimited" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                                        <input type="number" step="0.5" min="0" className="input" value={eventFormData.duration_hours} onChange={(e) => setEventFormData({ ...eventFormData, duration_hours: e.target.value })} placeholder="e.g. 2.5" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Recurring Type</label>
                                        <select className="input" value={eventFormData.recurring_type} onChange={(e) => setEventFormData({ ...eventFormData, recurring_type: e.target.value })}>
                                            <option value="none">None (One-time)</option>
                                            <option value="weekly">Weekly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Recurring Day</label>
                                        <select className="input" value={eventFormData.recurring_day} onChange={(e) => setEventFormData({ ...eventFormData, recurring_day: e.target.value })} disabled={eventFormData.recurring_type === 'none'}>
                                            <option value="">Select day</option>
                                            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Required Sessions (for certificate)</label>
                                        <input type="number" min="1" className="input" value={eventFormData.required_sessions} onChange={(e) => setEventFormData({ ...eventFormData, required_sessions: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Poster URL</label>
                                        <input type="url" className="input" value={eventFormData.poster_url} onChange={(e) => setEventFormData({ ...eventFormData, poster_url: e.target.value })} placeholder="https://..." />
                                    </div>
                                    {/* Social Media (structure only) */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Instagram Post URL (optional)</label>
                                        <input type="url" className="input" value={eventFormData.instagram_post || ''} onChange={(e) => setEventFormData({ ...eventFormData, instagram_post: e.target.value })} placeholder="https://instagram.com/p/..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Facebook Post URL (optional)</label>
                                        <input type="url" className="input" value={eventFormData.facebook_post || ''} onChange={(e) => setEventFormData({ ...eventFormData, facebook_post: e.target.value })} placeholder="https://facebook.com/..." />
                                    </div>
                                    <div className="md:col-span-2">
                                        <button type="submit" disabled={loading} className="btn btn-primary">
                                            {loading ? 'Creating...' : 'Create Event'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid gap-4">
                            {events.map((event) => (
                                <div key={event.id} className="card">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-semibold">{event.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                            <div className="mt-2 flex gap-4 text-sm text-gray-600">
                                                <span>📅 {new Date(event.event_date).toLocaleDateString()}</span>
                                                <span>📍 {event.city}, {event.state}</span>
                                                <span className={`badge ${event.status === 'upcoming' ? 'badge-info' : 'badge-success'}`}>
                                                    {event.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setActiveTab('attendance'); loadEventRegistrations(event.id); }} className="btn btn-secondary text-sm">
                                                Attendance
                                            </button>
                                            <button onClick={() => handleGenerateCertificates(event.id)} className="btn btn-primary text-sm">
                                                Generate Certificates
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'volunteers' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">Pending Volunteer Approvals</h2>
                        {pendingVolunteers.length === 0 ? (
                            <div className="card text-center text-gray-600">No pending approvals</div>
                        ) : (
                            <div className="grid gap-4">
                                {pendingVolunteers.map((volunteer) => (
                                    <div key={volunteer.id} className="card">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold">{volunteer.volunteer_profiles?.full_name}</h3>
                                                <p className="text-sm text-gray-600">{volunteer.email}</p>
                                                <p className="text-sm text-gray-600">
                                                    {volunteer.volunteer_profiles?.phone} • {volunteer.volunteer_profiles?.city}, {volunteer.volunteer_profiles?.state}
                                                </p>
                                            </div>
                                            <button onClick={() => handleApproveVolunteer(volunteer.id)} className="btn btn-primary">
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">Mark Attendance</h2>
                        {!selectedEvent ? (
                            <div className="card text-center text-gray-600">Select an event from the Events tab</div>
                        ) : (
                            <div className="grid gap-4">
                                {eventRegistrations.map((reg) => (
                                    <div key={reg.id} className="card">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold">{reg.users?.volunteer_profiles?.full_name}</h3>
                                                <p className="text-sm text-gray-600">{reg.users?.email}</p>
                                                <span className={`badge ${reg.status === 'attended' ? 'badge-success' : 'badge-warning'}`}>
                                                    {reg.status}
                                                </span>
                                            </div>
                                            {reg.status !== 'attended' && (
                                                <button onClick={() => handleMarkAttendance(reg.id)} className="btn btn-primary">
                                                    Mark Attended
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'certificates' && (
                    <div className="card text-center">
                        <p className="text-gray-600">Select an event from the Events tab and click "Generate Certificates"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
