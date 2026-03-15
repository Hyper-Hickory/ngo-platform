import api from './api';

export const volunteerService = {
    getProfile: async () => {
        return await api.get('/volunteers/profile');
    },

    updateProfile: async (profileData) => {
        return await api.put('/volunteers/profile', profileData);
    },

    getMyEvents: async () => {
        return await api.get('/volunteers/events');
    },

    getMyCertificates: async () => {
        return await api.get('/volunteers/certificates');
    },

    getPending: async () => {
        return await api.get('/volunteers/pending');
    },

    approve: async (volunteerId) => {
        return await api.put(`/volunteers/${volunteerId}/approve`);
    },

    getAll: async () => {
        return await api.get('/volunteers');
    },
};
