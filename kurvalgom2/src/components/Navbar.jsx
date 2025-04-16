import { Link } from "react-router-dom";

function Navbar({ loggedInUser, onLogout }) {
    return (
        <nav className="navbar">
            <div className="nav-links">
                <Link to="/">Home</Link> |
                <Link to="/blog">Blog</Link> |
                <Link to="/history">History</Link>
            </div>
            <div className="navbar-right">
                {loggedInUser ? (
                    <span>
                        Logged in: {loggedInUser.Username}
                        <button onClick={onLogout} className="logout-btn">Logout</button>
                    </span>
                ) : (
                    <>
                        <Link to="/register" className="nav-link">Register</Link>
                        <Link to="/login" className="nav-link">Login</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;