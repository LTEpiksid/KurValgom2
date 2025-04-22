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

    // Debug: Log the user object to see what properties are available
    console.log('User object in Navbar:', user);

    // Use user.user_metadata?.username if available (Supabase stores custom data here),
    // otherwise fall back to user.email or 'User'
    const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Left Section - Navigation Links */}
                <div className="navbar-left">
                    <Link to="/" className="navbar-link">
                        Home
                    </Link>
                    <Link to="/blog" className="navbar-link">
                        Blog
                    </Link>
                    <Link to="/history" className="navbar-link">
                        History
                    </Link>
                </div>

                {/* Center Section - Logo/Title */}
                <Link to="/" className="navbar-title">
                    KurValgom?
                </Link>

                {/* Right Section - Auth Controls */}
                <div className="navbar-right">
                    {user ? (
                        <>
                            <span className="navbar-username">
                                {displayName}
                            </span>
                            <button
                                onClick={handleLogoutClick}
                                className="navbar-auth-button"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="navbar-auth-button"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="navbar-auth-button"
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