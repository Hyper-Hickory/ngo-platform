import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function CoordinatorDashboard() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [attLoading, setAttLoading] = useState(false);
    const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportDownloading, setReportDownloading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    // Load assigned events
    useEffect(() => {
        fetch(`${API_BASE}/coordinator/events`, { headers: getAuthHeader() })
            .then(r => r.json())
            .then(d => setEvents(d.events || []))
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, []);

    // Load attendance when an event is selected
    const loadAttendance = async (event) => {
        setSelectedEvent(event);
        setAttLoading(true);
        try {
            const res = await fetch(`${API_BASE}/attendance/event/${event.id}`, { headers: getAuthHeader() });
            const d = await res.json();
            setAttendance(d.records || []);
        } catch {
            setAttendance([]);
        } finally {
            setAttLoading(false);
        }
    };

    // Mark attendance for a volunteer
    const markAttendance = async (volunteerId, present) => {
        try {
            const res = await fetch(`${API_BASE}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify({ volunteer_id: volunteerId, event_id: selectedEvent.id, date: markDate, present }),
            });
            const d = await res.json();
            if (d.success) {
                showToast(`Attendance ${present ? 'marked present ✓' : 'marked absent ✗'}`);
                loadAttendance(selectedEvent);
            } else {
                showToast(d.message || 'Failed to mark attendance', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        }
    };

    // Download PDF report
    const downloadReport = async (eventId, eventTitle) => {
        setReportDownloading(true);
        try {
            const res = await fetch(`${API_BASE}/coordinator/events/${eventId}/report`, { headers: getAuthHeader() });
            if (!res.ok) throw new Error('Failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `report-${eventTitle}.pdf`; a.click();
            URL.revokeObjectURL(url);
        } catch {
            showToast('Failed to download report', 'error');
        } finally {
            setReportDownloading(false);
        }
    };

    const dateStr = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-medium transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <header className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-black">🗓 Coordinator Dashboard</h1>
                    <p className="text-emerald-100 mt-1">Manage your assigned events and mark attendance</p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-5 gap-8">

                    {/* Left: Assigned Events List */}
                    <div className="lg:col-span-2">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Assigned Events</h2>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-200 animate-pulse" />)}
                            </div>
                        ) : events.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-dashed border-gray-300">
                                No events assigned to you yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {events.map((ev) => (
                                    <div
                                        key={ev.id}
                                        onClick={() => loadAttendance(ev)}
                                        className={`bg-white rounded-2xl p-5 cursor-pointer border-2 transition-all hover:shadow-md ${selectedEvent?.id === ev.id ? 'border-emerald-500 shadow-md' : 'border-transparent'}`}
                                    >
                                        <h3 className="font-bold text-gray-900 truncate">{ev.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">📅 {dateStr(ev.event_date)}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ev.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : ev.status === 'ongoing' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {ev.status}
                                            </span>
                                            {ev.duration_hours && <span className="text-xs text-gray-400">⏱ {ev.duration_hours}h</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Attendance Panel */}
                    <div className="lg:col-span-3">
                        {!selectedEvent ? (
                            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-dashed border-gray-200 h-full flex items-center justify-center">
                                <div>
                                    <div className="text-5xl mb-3">👈</div>
                                    <p>Select an event to manage attendance</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                                {/* Event header */}
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6">
                                    <h2 className="text-xl font-black">{selectedEvent.title}</h2>
                                    <p className="text-emerald-100 text-sm mt-1">📅 {dateStr(selectedEvent.event_date)} {selectedEvent.venue && `• 📍 ${selectedEvent.venue}`}</p>
                                    {selectedEvent.required_sessions > 1 && (
                                        <p className="text-emerald-100 text-xs mt-1">Required sessions for certificate: {selectedEvent.required_sessions}</p>
                                    )}
                                </div>

                                <div className="p-6">
                                    {/* Date picker + report button */}
                                    <div className="flex items-center gap-4 mb-6 flex-wrap">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 block mb-1">Session Date</label>
                                            <input
                                                type="date"
                                                value={markDate}
                                                onChange={(e) => setMarkDate(e.target.value)}
                                                className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                            />
                                        </div>
                                        <button
                                            onClick={() => downloadReport(selectedEvent.id, selectedEvent.title)}
                                            disabled={reportDownloading}
                                            className="ml-auto flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-60"
                                        >
                                            {reportDownloading ? '⏳ Generating...' : '📥 Download Report'}
                                        </button>
                                    </div>

                                    {/* Attendance table */}
                                    {attLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)}
                                        </div>
                                    ) : attendance.length === 0 ? (
                                        <div className="text-center py-10 text-gray-400">No attendance records yet for this event.</div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50 text-gray-600">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-semibold">Volunteer</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Date</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                                                        <th className="px-4 py-3 text-left font-semibold">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {attendance.map((rec) => (
                                                        <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                                {rec.users?.volunteer_profiles?.full_name || rec.users?.email || rec.volunteer_id}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-500">{dateStr(rec.date)}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rec.present ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                                                    {rec.present ? '✓ Present' : '✗ Absent'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex gap-2">
                                                                    <button onClick={() => markAttendance(rec.volunteer_id, true)} className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1 rounded-lg font-semibold transition-all">Present</button>
                                                                    <button onClick={() => markAttendance(rec.volunteer_id, false)} className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-lg font-semibold transition-all">Absent</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
