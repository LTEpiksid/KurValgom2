// src/services/auth.js
import { loginUser, registerUser } from './indexedDB';

// Secret key for JWT (in a real app, this would be stored server-side)
const JWT_SECRET = 'your-jwt-secret-key';

// Helper function to create JWT token
const createToken = (user) => {
    // Simple JWT implementation for client-side
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const payload = {
        sub: user.UserID,
        username: user.Username,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // Base64 encode the header and payload
    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(payload));

    // Create signature (simplified for client-side demo)
    // In a real app, this would use a proper HMAC function
    const signature = btoa(
        JSON.stringify({
            data: base64Header + '.' + base64Payload,
            secret: JWT_SECRET
        })
    );

    return `${base64Header}.${base64Payload}.${signature}`;
};

// Helper function to decode JWT token
export const decodeToken = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(atob(parts[1]));

        // Check if token is expired
        if (payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return payload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// Authentication functions
export const login = async (username, password) => {
    try {
        const user = await loginUser(username, password);

        if (!user) {
            return { success: false, message: 'Invalid username or password' };
        }

        // Create JWT token
        const token = createToken(user);

        // Store token in localStorage
        localStorage.setItem('auth_token', token);

        return {
            success: true,
            user,
            token
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: error.message };
    }
};

export const register = async (username, password, email) => {
    try {
        const userId = await registerUser(username, password, email);

        if (!userId) {
            return { success: false, message: 'Registration failed' };
        }

        // Create user object
        const user = {
            UserID: userId,
            Username: username,
            email
        };

        // Create JWT token
        const token = createToken(user);

        // Store token in localStorage
        localStorage.setItem('auth_token', token);

        return {
            success: true,
            user,
            token
        };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: error.message };
    }
};

export const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('loggedInUser');
    return { success: true };
};

export const isAuthenticated = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    const decoded = decodeToken(token);
    return !!decoded;
};

export const getCurrentUser = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    const decoded = decodeToken(token);
    if (!decoded) {
        // Token is invalid or expired
        localStorage.removeItem('auth_token');
        localStorage.removeItem('loggedInUser');
        return null;
    }

    return {
        UserID: decoded.sub,
        Username: decoded.username,
        email: decoded.email
    };
};

export default {
    login,
    register,
    logout,
    isAuthenticated,
    getCurrentUser,
    decodeToken
};