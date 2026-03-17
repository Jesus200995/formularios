import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar({ menuOpen, setMenuOpen, user, onLogout }) {
  const location = useLocation()

  const navLinks = [
    { 
      path: '/', 
      label: 'Inicio',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    },
    { 
      path: '/services', 
      label: 'Formularios',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    },
    { 
      path: '/about', 
      label: 'Perfil',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    },
    { 
      path: '/contact', 
      label: 'Ayuda',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    }
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
    <>
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
        </div>
      </nav>

      {/* Overlay fuera del navbar para cubrir toda la pantalla */}
      <div className={`nav-overlay ${menuOpen ? 'active' : ''}`} onClick={closeMenu}></div>
      
      {/* Drawer fuera del navbar para cubrir toda la altura */}
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
          {navLinks.map((link, index) => (
            <li key={link.path} style={{ transitionDelay: menuOpen ? `${0.1 + index * 0.05}s` : '0s' }}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span className="nav-link-icon">{link.icon}</span>
                <span className="nav-link-label">{link.label}</span>
                <svg className="nav-link-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
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
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default Navbar
