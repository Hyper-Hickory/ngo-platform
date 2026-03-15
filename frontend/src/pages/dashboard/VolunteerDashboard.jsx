import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/event.service';
import { volunteerService } from '../../services/volunteer.service';
import { certificateService } from '../../services/certificate.service';

export default function VolunteerDashboard() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('events');
    const [events, setEvents] = useState([]);
    const [myEvents, setMyEvents] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [eventsRes, myEventsRes, certsRes] = await Promise.all([
                eventService.getAll({ upcoming: true }),
                volunteerService.getMyEvents(),
                certificateService.getMyCertificates(),
            ]);
            setEvents(eventsRes.events || []);
            setMyEvents(myEventsRes.events || []);
            setCertificates(certsRes.certificates || []);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleRegisterForEvent = async (eventId) => {
        setLoading(true);
        try {
            await eventService.register(eventId);
            setMessage('Successfully registered for event!');
            loadData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error: ' + (error.message || 'Could not register for event'));
            setTimeout(() => setMessage(''), 3000);
        }
        setLoading(false);
    };

    const isRegistered = (eventId) => {
        return myEvents.some(e => e.events?.id === eventId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
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
                    <div className={`px-4 py-3 rounded-lg ${message.includes('Error')
                            ? 'bg-red-50 border border-red-200 text-red-700'
                            : 'bg-green-50 border border-green-200 text-green-700'
                        }`}>
                        {message}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 mt-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {['events', 'my-events', 'certificates'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                        ? 'border-primary-600 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.replace('-', ' ')}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                    <div>
                        <h2 className="text-xl font-bold mb-6">Available Events</h2>
                        {events.length === 0 ? (
                            <div className="card text-center text-gray-600">No upcoming events available</div>
                        ) : (
                            <div className="grid gap-4">
                                {events.map((event) => (
                                    <div key={event.id} className="card">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h3 className="text-lg font-semibold">{event.title}</h3>
                                                    {event.recurring_type === 'weekly' && (
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Weekly</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {new Date(event.event_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {event.start_time} - {event.end_time}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        {event.venue}, {event.city}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                        {event.event_type}
                                                    </div>
                                                </div>
                                                {/* Phase 2 fields */}
                                                <div className="flex gap-3 mt-2 flex-wrap">
                                                    {event.duration_hours && (
                                                        <span className="text-xs text-gray-500">⏱ {event.duration_hours}h</span>
                                                    )}
                                                    {event.max_volunteers && (
                                                        <span className="text-xs text-gray-500">
                                                            👥 {event.registration_count || 0}/{event.max_volunteers} volunteers
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4 flex flex-col items-end gap-2">
                                                {/* Event Full badge */}
                                                {event.is_full && (
                                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600">Event Full</span>
                                                )}
                                                {isRegistered(event.id) ? (
                                                    <span className="badge badge-success">Registered</span>
                                                ) : event.is_full ? (
                                                    <button
                                                        disabled
                                                        className="btn btn-secondary opacity-50 cursor-not-allowed"
                                                        title="This event has reached maximum volunteer capacity"
                                                    >
                                                        Event Full
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRegisterForEvent(event.id)}
                                                        disabled={loading}
                                                        className="btn btn-primary"
                                                    >
                                                        {loading ? 'Registering...' : 'Register'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                {activeTab === 'my-events' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">My Registered Events</h2>
                        {myEvents.length === 0 ? (
                            <div className="card text-center text-gray-600">
                                You haven't registered for any events yet
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {myEvents.map((registration) => (
                                    <div key={registration.id} className="card">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-semibold">{registration.events?.title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">{registration.events?.description}</p>
                                                <div className="mt-2 flex gap-4 text-sm text-gray-600">
                                                    <span>📅 {new Date(registration.events?.event_date).toLocaleDateString()}</span>
                                                    <span>📍 {registration.events?.city}</span>
                                                </div>
                                            </div>
                                            <span className={`badge ${registration.status === 'attended' ? 'badge-success' :
                                                    registration.status === 'registered' ? 'badge-info' :
                                                        'badge-warning'
                                                }`}>
                                                {registration.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'certificates' && (
                    <div>
                        <h2 className="text-xl font-bold mb-6">My Certificates</h2>
                        {certificates.length === 0 ? (
                            <div className="card text-center text-gray-600">
                                No certificates yet. Attend events to earn certificates!
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {certificates.map((cert) => (
                                    <div key={cert.id} className="card">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-semibold">{cert.event_title}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Certificate No: <span className="font-mono font-semibold">{cert.certificate_number}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Issued: {new Date(cert.issued_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <a
                                                href={cert.pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary"
                                            >
                                                Download PDF
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
