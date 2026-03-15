import supabase from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Register a new volunteer
 */
export const registerVolunteer = async (userData) => {
    const { email, password, full_name, phone, date_of_birth, gender, city, state, address, pincode, occupation, skills } = userData;

    // Check if user already exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (existingUser) {
        throw new Error('Email already registered');
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
            email,
            password_hash,
            role: 'volunteer',
            is_approved: false, // Requires admin approval
        })
        .select()
        .single();

    if (userError) throw userError;

    // Create volunteer profile
    const { error: profileError } = await supabase
        .from('volunteer_profiles')
        .insert({
            user_id: user.id,
            full_name,
            phone,
            date_of_birth,
            gender,
            city,
            state,
            address,
            pincode,
            occupation,
            skills,
        });

    if (profileError) throw profileError;

    return {
        message: 'Registration successful! Your account is pending admin approval.',
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            is_approved: user.is_approved,
        },
    };
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
    // Get user with password
    const { data: user, error } = await supabase
        .from('users')
        .select('id, email, password_hash, role, is_approved, is_active')
        .eq('email', email)
        .single();

    if (error || !user) {
        throw new Error('Invalid email or password');
    }

    // Check if account is active
    if (!user.is_active) {
        throw new Error('Your account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        isApproved: user.is_approved,
    });

    // Get profile information
    let profile = null;
    if (user.role === 'volunteer') {
        const { data } = await supabase
            .from('volunteer_profiles')
            .select('full_name, phone, city')
            .eq('user_id', user.id)
            .single();
        profile = data;
    }

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            is_approved: user.is_approved,
            profile,
        },
    };
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (userId, userRole) => {
    const { data: user } = await supabase
        .from('users')
        .select('id, email, role, is_approved, is_active, created_at')
        .eq('id', userId)
        .single();

    if (!user) {
        throw new Error('User not found');
    }

    // Get profile based on role
    if (userRole === 'volunteer') {
        const { data: profile } = await supabase
            .from('volunteer_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        return { ...user, profile };
    }

    return user;
};
