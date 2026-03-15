import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generate JWT token for user
 */
export const generateToken = (payload) => {
    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiry,
    });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Decode JWT token without verification
 */
export const decodeToken = (token) => {
    return jwt.decode(token);
};
