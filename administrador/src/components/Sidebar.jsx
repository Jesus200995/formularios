import { NavLink, useLocation } from 'react-router-dom'
import { 
  HiOutlineChartBar, 
  HiOutlineUsers, 
  HiOutlineDocumentText, 
  HiOutlineChartPie, 
  HiOutlineCog,
  HiOutlineUser
} from 'react-icons/hi'
import './Sidebar.css'

function Sidebar({ collapsed, mobileOpen, onMobileClose }) {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: <HiOutlineChartBar size={20} />, label: 'Dashboard' },
    { path: '/users', icon: <HiOutlineUsers size={20} />, label: 'Usuarios' },
    { path: '/forms', icon: <HiOutlineDocumentText size={20} />, label: 'Formularios' },
    { path: '/analytics', icon: <HiOutlineChartPie size={20} />, label: 'Analíticas' },
    { path: '/settings', icon: <HiOutlineCog size={20} />, label: 'Configuración' }
  ]

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="brand-icon">A</span>
          {!collapsed && <span className="brand-text">Admin Panel</span>}
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={onMobileClose}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar"><HiOutlineUser size={18} /></div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">Admin</span>
              <span className="user-role">Administrador</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
