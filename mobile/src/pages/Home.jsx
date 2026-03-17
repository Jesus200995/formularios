import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const [formularios, setFormularios] = useState([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Obtener nombre del usuario
    const user = JSON.parse(localStorage.getItem('app_user') || '{}')
    if (user.nombre) {
      setUserName(user.nombre.split(' ')[0])
    } else if (user.name) {
      setUserName(user.name.split(' ')[0])
    } else if (user.email) {
      setUserName(user.email.split('@')[0])
    }
    
    fetchFormularios()
  }, [])

  const fetchFormularios = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('app_token')
      
      const response = await fetch('https://apidata.geodatos.com.mx/api/forms/app/published', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (!response.ok) throw new Error('Error al cargar formularios')

      const data = await response.json()
      setFormularios(data.slice(0, 4)) // Solo los primeros 4 para preview
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffDays < 1) return 'Hoy'
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
  }

  const getFormIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )

  const totalResponses = formularios.reduce((acc, f) => acc + (f.submission_count || 0), 0)

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-greeting">
          <span className="wave">👋</span>
          <span>{userName ? `Hola, ${userName}` : 'Bienvenido'}</span>
        </div>
        <h1 className="hero-title">DATA Formularios</h1>
        <p className="hero-subtitle">Gestiona y responde formularios de manera rápida y sencilla</p>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <div className="quick-actions-grid">
          <Link to="/services" className="quick-action-card">
            <div className="action-icon forms">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
                <path d="M9 12h6M9 16h6"/>
              </svg>
            </div>
            <div className="action-text">
              <p className="action-title">Formularios</p>
              <p className="action-subtitle">{formularios.length} disponibles</p>
            </div>
          </Link>

          <Link to="/about" className="quick-action-card">
            <div className="action-icon profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="action-text">
              <p className="action-title">Mi Perfil</p>
              <p className="action-subtitle">Ver información</p>
            </div>
          </Link>

          <Link to="/contact" className="quick-action-card">
            <div className="action-icon help">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="action-text">
              <p className="action-title">Ayuda</p>
              <p className="action-subtitle">Soporte</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Forms Preview */}
      <section className="forms-section">
        <div className="section-header">
          <h2 className="section-title">Formularios recientes</h2>
          <Link to="/services" className="see-all-link">
            Ver todos
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="forms-loading">
            {[1, 2, 3].map(i => (
              <div key={i} className="form-skeleton">
                <div className="skeleton-icon"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-meta"></div>
                </div>
              </div>
            ))}
          </div>
        ) : formularios.length > 0 ? (
          <div className="forms-preview-list">
            {formularios.map((form) => (
              <Link 
                key={form.id} 
                to={`/formulario/${form.public_code || form.id}`}
                className="form-preview-card"
              >
                <div className="form-icon-box">
                  {getFormIcon()}
                </div>
                <div className="form-preview-info">
                  <h3 className="form-preview-title">{form.title}</h3>
                  <div className="form-preview-meta">
                    <span className="form-status-badge active">Activo</span>
                    <span className="dot"></span>
                    <span>{getRelativeTime(form.updated_at)}</span>
                    <span className="dot"></span>
                    <span>{form.submission_count || 0} respuestas</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="forms-empty">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <h3>Sin formularios</h3>
            <p>No hay formularios disponibles en este momento</p>
          </div>
        )}
      </section>

      {/* Stats Card */}
      <section className="home-stats">
        <div className="stats-card">
          <p className="stats-title">Resumen de actividad</p>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{formularios.length}</span>
              <span className="stat-label">Formularios</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalResponses}</span>
              <span className="stat-label">Respuestas</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{formularios.filter(f => f.status === 'published').length}</span>
              <span className="stat-label">Activos</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
