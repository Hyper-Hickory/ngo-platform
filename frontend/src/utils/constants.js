export const ROLES = {
    VOLUNTEER: 'volunteer',
    ADMIN: 'admin',
};

export const EVENT_STATUS = {
    UPCOMING: 'upcoming',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

export const REGISTRATION_STATUS = {
    REGISTERED: 'registered',
    ATTENDED: 'attended',
    ABSENT: 'absent',
    CANCELLED: 'cancelled',
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
