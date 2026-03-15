import api from './api';

export const eventService = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return await api.get(`/events?${params}`);
    },

    getById: async (id) => {
        return await api.get(`/events/${id}`);
    },

    create: async (eventData) => {
        return await api.post('/events', eventData);
    },

    update: async (id, eventData) => {
        return await api.put(`/events/${id}`, eventData);
    },

    delete: async (id) => {
        return await api.delete(`/events/${id}`);
    },

    register: async (eventId) => {
        return await api.post(`/events/${eventId}/register`);
    },

    getRegistrations: async (eventId) => {
        return await api.get(`/events/${eventId}/registrations`);
    },

    markAttendance: async (registrationId) => {
        return await api.put(`/events/registrations/${registrationId}/attendance`);
    },

    bulkMarkAttendance: async (registrationIds) => {
        return await api.post('/events/attendance/bulk', { registration_ids: registrationIds });
    },
};
