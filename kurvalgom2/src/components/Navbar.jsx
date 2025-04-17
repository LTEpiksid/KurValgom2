import { useAuth } from '../App';
import { logoutUser } from '../services/supabase';
import { useNavigate, Link } from 'react-router-dom';

function Navbar() {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();

    const handleLogoutClick = async () => {
        try {
            await logoutUser();
            handleLogout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="fixed top-0 w-full bg-black border-b-2 border-light-orange z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between h-20">
                {/* Left Section - Navigation Links */}
                <div className="flex items-center space-x-8">
                    <Link to="/" className="nav-link font-medium text-lg">
                        Home
                    </Link>
                    <Link to="/blog" className="nav-link font-medium text-lg">
                        Blog
                    </Link>
                    <Link to="/history" className="nav-link font-medium text-lg">
                        History
                    </Link>
                </div>

                {/* Center Section - Logo/Title */}
                <Link to="/" className="nav-title absolute left-1/2 transform -translate-x-1/2 text-4xl">
                    KurValgom?
                </Link>

                {/* Right Section - Auth Controls */}
                <div className="flex items-center space-x-8">
                    {user ? (
                        <>
                            <span className="text-mossy-green font-medium text-lg">
                                {user.username || 'User'}
                            </span>
                            <button
                                onClick={handleLogoutClick}
                                className="auth-button font-medium text-lg"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="auth-button font-medium text-lg"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="auth-button font-medium text-lg"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;