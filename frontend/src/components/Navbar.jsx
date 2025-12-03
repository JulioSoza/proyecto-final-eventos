// FRONTEND - src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '../api/auth';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const handleStorage = () => {
      setUser(getCurrentUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <Link to="/">EventosApp</Link>
      </div>

      <nav className="navbar-nav">
        <div className="navbar-links">
          <Link to="/">Inicio</Link>

          {/* Link Mis boletos para cualquier usuario logueado */}
          {user && <Link to="/mis-boletos">Mis boletos</Link>}

          {/* Solo admins ven el panel */}
          {user && user.role === 'admin' && (
            <Link to="/admin/events">Panel admin</Link>
          )}

          {user ? (
            <>
              <span className="navbar-user">Hola, {user.name}</span>
              <button className="btn btn-primary" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Registro</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
