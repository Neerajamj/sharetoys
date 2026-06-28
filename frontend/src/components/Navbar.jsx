import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">🧸 ShareToys</Link>
      <nav className="nav-links">
        {user ? (
          <>
            <Link to="/add" className="btn-pill">📌 Pin a toy</Link>
            <Link to="/orders" className="link-btn">My Orders</Link>
            <span className="hello">Hi, {user.name}</span>
            <button
              className="link-btn"
              onClick={() => { logout(); navigate('/'); }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="link-btn">Log in</Link>
            <Link to="/register" className="btn-pill">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
