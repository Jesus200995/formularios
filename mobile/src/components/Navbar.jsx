import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar({ menuOpen, setMenuOpen, user, onLogout }) {
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/services', label: 'Formularios' },
    { path: '/about', label: 'Perfil' },
    { path: '/contact', label: 'Ayuda' }
  ]

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const handleLogout = () => {
    closeMenu()
    onLogout()
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <svg className="brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="brand-text">DATA</span>
        </Link>

        {user && (
          <div className="user-badge">
            <span className="user-initials">
              {user.nombre?.charAt(0)}{user.apellidos?.charAt(0)}
            </span>
          </div>
        )}

        <button 
          className={`hamburger ${menuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-overlay ${menuOpen ? 'active' : ''}`} onClick={closeMenu}></div>
        
        <div className={`nav-drawer ${menuOpen ? 'active' : ''}`}>
          {user && (
            <div className="drawer-header">
              <div className="drawer-user">
                <div className="drawer-avatar">
                  {user.nombre?.charAt(0)}{user.apellidos?.charAt(0)}
                </div>
                <div className="drawer-user-info">
                  <span className="drawer-user-name">{user.nombre} {user.apellidos}</span>
                  <span className="drawer-user-role">{user.puesto_trabajo}</span>
                </div>
              </div>
            </div>
          )}
          
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          
          {user && (
            <div className="drawer-footer">
              <button className="logout-button" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
