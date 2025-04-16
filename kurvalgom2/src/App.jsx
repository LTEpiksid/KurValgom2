import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Blog from './pages/Blog';
import History from './pages/History';
import Register from './pages/Register';
import Login from './pages/Login';
import './styles/global.css';

// Error Boundary Component
class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="dark-theme">
                    <h2>Something went wrong</h2>
                    <p>{this.state.error.message}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('loggedInUser');
        if (user) setLoggedInUser(JSON.parse(user));
    }, []);

    const handleLogin = (user) => {
        setLoggedInUser(user);
        localStorage.setItem('loggedInUser', JSON.stringify(user));
    };

    const handleLogout = () => {
        setLoggedInUser(null);
        localStorage.removeItem('loggedInUser');
    };

    return (
        <Router>
            <Navbar loggedInUser={loggedInUser} onLogout={handleLogout} />
            <ErrorBoundary>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/register" element={<Register onLogin={handleLogin} />} />
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </ErrorBoundary>
        </Router>
    );
}

export default App;