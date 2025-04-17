import { createClient } from '@supabase/supabase-js';

// No-op storage to disable persistence
const noOpStorage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
};

// Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
    throw new Error('VITE_SUPABASE_URL is not defined in .env');
}
if (!supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY is not defined in .env');
}

// Log for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: noOpStorage,
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
});

// Log auth state changes for debugging
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
});

export async function loginUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
}

export async function registerUser(email, password, username) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username },
        },
    });
    if (error) throw error;
    return data.user;
}

export async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function createBlogPost(userId, image, comment, rating, restaurant) {
    const { data, error } = await supabase
        .from('blogs')
        .insert([{ user_id: userId, image, comment, rating, restaurant }]);
    if (error) throw error;
    return data;
}

export async function getAllBlogPosts() {
    const { data, error } = await supabase
        .from('blogs')
        .select(`
            blog_id,
            user_id,
            image,
            comment,
            created_at,
            rating,
            restaurant,
            users:user_id (username)
        `);
    if (error) throw error;
    // Map the data to flatten the username from the nested users object
    return data.map(post => ({
        ...post,
        username: post.users?.username || 'Anonymous'
    })) || [];
}

export async function updateBlogPost(blogId, updates) {
    const { data, error } = await supabase
        .from('blogs')
        .update(updates)
        .eq('blog_id', blogId);
    if (error) throw error;
    return data;
}

export async function deleteBlogPost(blogId) {
    const { data, error } = await supabase
        .from('blogs')
        .delete()
        .eq('blog_id', blogId);
    if (error) throw error;
    return data;
}

export async function addToHistory(userId, restaurantId, restaurantData) {
    const { data, error } = await supabase
        .from('history')
        .insert([{ user_id: userId, restaurant_id: restaurantId, restaurant_data: restaurantData }]);
    if (error) throw error;
    return data;
}

export async function getHistory(userId) {
    const { data, error } = await supabase
        .from('history')
        .select('id, user_id, restaurant_id, restaurant_data, visited_at')
        .eq('user_id', userId)
        .order('visited_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export { supabase };