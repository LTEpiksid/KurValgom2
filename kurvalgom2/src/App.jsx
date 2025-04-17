import { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { getCurrentUser } from './services/supabase'; // Named import
import { supabase } from './services/supabase'; // Named import (fixed)

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Blog from './pages/Blog';
import History from './pages/History';
import Register from './pages/Register';
import Login from './pages/Login';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = () => {
        setUser(null);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={{ user, handleLogout }}>
            <Router>
                <div className="app">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;