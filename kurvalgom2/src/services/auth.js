import { registerUser, loginUser, logoutUser, getCurrentUser } from './supabase';

export const login = async (email, password) => {
    try {
        const user = await loginUser(email, password);
        if (!user) {
            return { success: false, message: 'Invalid email or password' };
        }
        return { success: true, user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: error.message };
    }
};

export const register = async (username, email, password) => {
    try {
        const user = await registerUser(username, email, password);
        return { success: true, user };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: error.message };
    }
};

export const logout = async () => {
    try {
        await logoutUser();
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, message: error.message };
    }
};

export const isAuthenticated = async () => {
    try {
        const user = await getCurrentUser();
        return !!user;
    } catch (error) {
        console.error('Auth check error:', error);
        return false;
    }
};

export default {
    login,
    register,
    logout,
    isAuthenticated,
    getCurrentUser
};