// src/services/indexedDB.js - Updated functions
import bcrypt from 'bcryptjs';

const DB_NAME = 'kurvalgom_db';
const DB_VERSION = 2; // Increased version to handle schema changes

// Store names
const USERS_STORE = 'users';
const BLOG_STORE = 'blogs';
const HISTORY_STORE = 'history';

// Helper function to open the database
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create Users store with auto-incrementing ID
            if (!db.objectStoreNames.contains(USERS_STORE)) {
                const usersStore = db.createObjectStore(USERS_STORE, { keyPath: 'UserID', autoIncrement: true });
                usersStore.createIndex('username', 'Username', { unique: true });
                usersStore.createIndex('email', 'email', { unique: false });
            }

            // Create Blog store with updated schema
            if (!db.objectStoreNames.contains(BLOG_STORE)) {
                const blogStore = db.createObjectStore(BLOG_STORE, { keyPath: 'BlogID', autoIncrement: true });
                blogStore.createIndex('userId', 'UserID', { unique: false });
                blogStore.createIndex('date', 'date', { unique: false });
            } else if (event.oldVersion < 2) {
                // If upgrading from version 1, delete and recreate the blog store
                db.deleteObjectStore(BLOG_STORE);
                const blogStore = db.createObjectStore(BLOG_STORE, { keyPath: 'BlogID', autoIncrement: true });
                blogStore.createIndex('userId', 'UserID', { unique: false });
                blogStore.createIndex('date', 'date', { unique: false });
            }

            // Create History store
            if (!db.objectStoreNames.contains(HISTORY_STORE)) {
                const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: 'id', autoIncrement: true });
                historyStore.createIndex('userId', 'UserID', { unique: false });
                historyStore.createIndex('restaurantId', 'restaurantId', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            resolve(db);
        };
    });
};

// Initialize the database
export const initDB = async () => {
    try {
        console.log('Initializing database...');
        const db = await openDB();
        console.log('Database initialized successfully');
        db.close();
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

// User Authentication Functions
export const registerUser = async (username, password, email) => {
    try {
        const db = await openDB();
        const hashedPassword = await bcrypt.hash(password, 10);

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([USERS_STORE], 'readwrite');
            const store = transaction.objectStore(USERS_STORE);

            // Check if username already exists
            const index = store.index('username');
            const request = index.get(username);

            request.onsuccess = (event) => {
                if (event.target.result) {
                    db.close();
                    reject(new Error('Username already exists'));
                    return;
                }

                // Username doesn't exist, create new user
                const addRequest = store.add({
                    Username: username,
                    Password: hashedPassword,
                    email: email,
                    createdAt: new Date().toISOString()
                });

                addRequest.onsuccess = (event) => {
                    const userId = event.target.result;
                    db.close();
                    resolve(userId);
                };

                addRequest.onerror = (event) => {
                    db.close();
                    reject(event.target.error);
                };
            };

            request.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const loginUser = async (username, password) => {
    try {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([USERS_STORE], 'readonly');
            const store = transaction.objectStore(USERS_STORE);
            const index = store.index('username');
            const request = index.get(username);

            request.onsuccess = async (event) => {
                const user = event.target.result;
                db.close();

                if (!user) {
                    resolve(null);
                    return;
                }

                try {
                    const passwordMatch = await bcrypt.compare(password, user.Password);
                    if (passwordMatch) {
                        // Don't return the password
                        const { Password, ...userWithoutPassword } = user;
                        resolve(userWithoutPassword);
                    } else {
                        resolve(null);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            request.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

// Blog CRUD Functions - Updated for new schema
export const createBlogPost = async (userId, image, comment, rating, restaurant) => {
    try {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([BLOG_STORE], 'readwrite');
            const store = transaction.objectStore(BLOG_STORE);

            const blogPost = {
                UserID: userId,
                Image: image || '',
                comment: comment,
                rating: rating,
                restaurant: restaurant,
                date: new Date().toISOString()
            };

            const request = store.add(blogPost);

            request.onsuccess = (event) => {
                const blogId = event.target.result;
                db.close();
                resolve(blogId);
            };

            request.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Error creating blog post:', error);
        throw error;
    }
};

export const getAllBlogPosts = async () => {
    try {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([BLOG_STORE], 'readonly');
            const store = transaction.objectStore(BLOG_STORE);
            const request = store.getAll();

            request.onsuccess = (event) => {
                const blogs = event.target.result;
                db.close();
                resolve(blogs);
            };

            request.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Error getting blog posts:', error);
        throw error;
    }
};

export const getBlogPostById = async (blogId) => {
    try {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([BLOG_STORE], 'readonly');
            const store = transaction.objectStore(BLOG_STORE);
            const request = store.get(blogId);

            request.onsuccess = (event) => {
                const blog = event.target.result;
                db.close();
                resolve(blog);
            };

            request.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Error getting blog post:', error);
        throw error;
    }
};

export const updateBlogPost = async (blogId, updates) => {
    try {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([BLOG_STORE], 'readwrite');
            const store = transaction.objectStore(BLOG_STORE);

            // First get the current blog post
            const getRequest = store.get(blogId);

            getRequest.onsuccess = (event) => {
                const blog = event.target.result;
                if (!blog) {
                    db.close();
                    reject(new Error('Blog post not found'));
                    return;
                }

                // Check if the current user is the owner
                const currentUser = getCurrentUser();
                if (blog.UserID !== currentUser?.UserID) {
                    db.close();
                    reject(new Error('Only the author can update this post'));
                    return;
                }

                // Update with new values
                const updatedBlog = {
                    ...blog,
                    ...updates,
                    updatedAt: new Date().toISOString()
                };

                // Put the updated blog back
                const putRequest = store.put(updatedBlog);

                putRequest.onsuccess = () => {
                    db.close();
                    resolve(true);
                };

                putRequest.onerror = (event) => {
                    db.close();
                    reject(event.target.error);
                };
            };

            getRequest.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Error updating blog post:', error);
        throw error;
    }
};

export const deleteBlogPost = async (blogId) => {
    try {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([BLOG_STORE], 'readwrite');
            const store = transaction.objectStore(BLOG_STORE);

            // First get the blog post to check ownership
            const getRequest = store.get(blogId);

            getRequest.onsuccess = (event) => {
                const blog = event.target.result;
                if (!blog) {
                    db.close();
                    reject(new Error('Blog post not found'));
                    return;
                }

                // Check if the current user is the owner
                const currentUser = getCurrentUser();
                if (blog.UserID !== currentUser?.UserID) {
                    db.close();
                    reject(new Error('Only the author can delete this post'));
                    return;
                }

                // Delete the blog post
                const deleteRequest = store.delete(blogId);

                deleteRequest.onsuccess = () => {
                    db.close();
                    resolve(true);
                };

                deleteRequest.onerror = (event) => {
                    db.close();
                    reject(event.target.error);
                };
            };

            getRequest.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        throw error;
    }
};

// History Functions
export const addToHistory = async (userId, restaurantId) => {
    try {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([HISTORY_STORE], 'readwrite');
            const store = transaction.objectStore(HISTORY_STORE);

            const historyEntry = {
                UserID: userId,
                restaurantId: restaurantId,
                timestamp: new Date().toISOString()
            };

            const request = store.add(historyEntry);

            request.onsuccess = (event) => {
                const historyId = event.target.result;
                db.close();
                resolve(historyId);
            };

            request.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Error adding to history:', error);
        throw error;
    }
};

export const getUserHistory = async (userId) => {
    try {
        const db = await openDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([HISTORY_STORE], 'readonly');
            const historyStore = transaction.objectStore(HISTORY_STORE);

            // Get all history entries for this user
            const index = historyStore.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = (event) => {
                const historyEntries = event.target.result;
                db.close();
                resolve(historyEntries);
            };

            request.onerror = (event) => {
                db.close();
                reject(event.target.error);
            };
        });
    } catch (error) {
        console.error('Error getting user history:', error);
        throw error;
    }
};

// Import this from auth.js to avoid circular dependencies
const getCurrentUser = () => {
    try {
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) return null;

        // Simple parsing of the token
        const parts = authToken.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp < Math.floor(Date.now() / 1000)) return null;

        return {
            UserID: payload.sub,
            Username: payload.username,
            email: payload.email
        };
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

// Export all functions
export default {
    initDB,
    registerUser,
    loginUser,
    createBlogPost,
    getAllBlogPosts,
    getBlogPostById,
    updateBlogPost,
    deleteBlogPost,
    addToHistory,
    getUserHistory
};