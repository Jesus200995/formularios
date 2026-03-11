import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  HiOutlineChartBar, 
  HiOutlineUsers, 
  HiOutlineDocumentText, 
  HiOutlineChartPie, 
  HiOutlineCog,
  HiOutlineUser,
  HiOutlineClipboardList
} from 'react-icons/hi'
import './Sidebar.css'

function Sidebar({ collapsed, mobileOpen, onMobileClose }) {
  const location = useLocation()
  const [userData, setUserData] = useState({ 
    full_name: 'Usuario', 
    first_name: 'Usuario',
    role: 'user' 
  })

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const parsedUser = JSON.parse(user)
        setUserData(parsedUser)
      } catch (error) {
        console.error('Error al parsear usuario:', error)
      }
    }
  }, [])

  const menuItems = [
    { path: '/', icon: <HiOutlineChartBar size={28} />, label: 'Dashboard' },
    { path: '/users', icon: <HiOutlineUsers size={28} />, label: 'Usuarios' },
    { path: '/forms', icon: <HiOutlineClipboardList size={28} />, label: 'Formularios' },
    { path: '/analytics', icon: <HiOutlineChartPie size={28} />, label: 'Analíticas' },
    { path: '/settings', icon: <HiOutlineCog size={28} />, label: 'Configuración' }
  ]

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <HiOutlineClipboardList size={36} />
          </div>
          {!collapsed && (
            <div className="brand-text-container">
              <span className="brand-title">DATA</span>
              <span className="brand-subtitle">Formularios</span>
            </div>
          )}
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
              <span className="user-name">{userData.full_name || userData.first_name || 'Usuario'}</span>
              <span className="user-role">{userData.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
