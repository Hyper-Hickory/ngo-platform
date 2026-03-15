import api from './api';

export const certificateService = {
    verify: async (certificateNumber) => {
        return await api.get(`/certificates/verify/${certificateNumber}`);
    },

    getMyCertificates: async () => {
        return await api.get('/certificates/volunteer');
    },

    generate: async (eventId) => {
        return await api.post(`/certificates/generate/${eventId}`);
    },
};
