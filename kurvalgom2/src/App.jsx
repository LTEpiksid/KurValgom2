// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Blog from './pages/Blog';
import History from './pages/History';
import Navbar from './components/Navbar';
import './styles/global.css';

export default function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/history" element={<History />} />
            </Routes>
        </Router>
    );
}