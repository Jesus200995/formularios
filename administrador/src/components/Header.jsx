import { 
  HiOutlineMenu, 
  HiOutlineSearch, 
  HiOutlineBell, 
  HiOutlineUser, 
  HiOutlineCog, 
  HiOutlineLogout,
  HiOutlineChevronDown
} from 'react-icons/hi'
import './Header.css'

function Header({ onToggleSidebar, onToggleMobileSidebar, onLogout }) {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle mobile-only" onClick={onToggleMobileSidebar}>
          <HiOutlineMenu size={20} />
        </button>
        <button className="menu-toggle desktop-only" onClick={onToggleSidebar}>
          <HiOutlineMenu size={20} />
        </button>
        <div className="search-box">
          <span className="search-icon"><HiOutlineSearch size={16} /></span>
          <input type="text" placeholder="Buscar..." />
        </div>
      </div>
      
      <div className="header-right">
        <button className="header-btn notification-btn">
          <HiOutlineBell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="header-dropdown">
          <button className="header-btn user-btn">
            <span className="user-avatar-small"><HiOutlineUser size={16} /></span>
            <span className="user-name-header">Admin</span>
            <span className="dropdown-arrow"><HiOutlineChevronDown size={14} /></span>
          </button>
          <div className="dropdown-menu">
            <a href="#" className="dropdown-item"><HiOutlineUser size={16} /> Mi Perfil</a>
            <a href="#" className="dropdown-item"><HiOutlineCog size={16} /> Configuración</a>
            <hr />
            <button onClick={onLogout} className="dropdown-item logout">
              <HiOutlineLogout size={16} /> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
