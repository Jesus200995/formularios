import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Formularios.css'

function Services() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [formularios, setFormularios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchFormularios()
  }, [])

  const fetchFormularios = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener token del usuario autenticado
      const token = localStorage.getItem('app_token')
      
      const response = await fetch('https://apidata.geodatos.com.mx/api/forms/app/published', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar formularios')
      }

      const data = await response.json()
      
      // Mapear los formularios del backend al formato de la UI
      const mappedForms = data.map(form => ({
        id: form.id,
        public_code: form.public_code,
        icon: getFormIcon(form.title),
        title: form.title,
        description: form.description || 'Sin descripción',
        responses: form.submission_count || 0,
        lastUpdated: getRelativeTime(form.updated_at),
        status: form.status === 'published' ? 'active' : 'draft',
        created_at: form.created_at
      }))
      
      setFormularios(mappedForms)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getFormIcon = (title) => {
    const titleLower = title.toLowerCase()
    
    if (titleLower.includes('cultivo') || titleLower.includes('siembra')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      )
    }
    if (titleLower.includes('producción') || titleLower.includes('cosecha')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      )
    }
    if (titleLower.includes('censo') || titleLower.includes('población')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    }
    if (titleLower.includes('familia') || titleLower.includes('hogar')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    }
    if (titleLower.includes('plaga') || titleLower.includes('control')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M2 12h20"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    }
    if (titleLower.includes('apoyo') || titleLower.includes('solicitud')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )
    }
    if (titleLower.includes('salud') || titleLower.includes('médico')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      )
    }
    if (titleLower.includes('educación') || titleLower.includes('escuela')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      )
    }
    // Default icon
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    )
  }

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
  }

  const tabs = [
    { id: 'todos', label: 'Todos', count: formularios.length },
    { id: 'active', label: 'Activos', count: formularios.filter(f => f.status === 'active').length },
    { id: 'pendientes', label: 'Pendientes', count: formularios.filter(f => f.responses === 0).length }
  ]

  const filteredFormularios = formularios.filter(form => {
    const matchesTab = activeTab === 'todos' || 
                       (activeTab === 'active' && form.status === 'active') ||
                       (activeTab === 'pendientes' && form.responses === 0)
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const handleOpenForm = (formId, publicCode) => {
    navigate(`/formulario/${publicCode || formId}`)
  }

  const handleRefresh = async () => {
    await fetchFormularios()
  }

  if (loading) {
    return (
      <div className="formularios-page">
        <div className="formularios-sticky-header">
          <div className="formularios-header-card">
            <div className="header-card-content">
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="2"/>
                  <path d="M9 12h6"/>
                  <path d="M9 16h6"/>
                </svg>
              </div>
              <div className="header-text">
                <h1>Formularios</h1>
                <p>Cargando formularios disponibles...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="formularios-grid-wrapper">
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
              </svg>
            </div>
            <h3>Cargando...</h3>
            <p>Por favor espera un momento</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="formularios-page">
        <div className="formularios-sticky-header">
          <div className="formularios-header-card">
            <div className="header-card-content">
              <div className="header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                  <rect x="9" y="3" width="6" height="4" rx="2"/>
                  <path d="M9 12h6"/>
                  <path d="M9 16h6"/>
                </svg>
              </div>
              <div className="header-text">
                <h1>Formularios</h1>
                <p>Error al cargar formularios</p>
              </div>
            </div>
          </div>
        </div>
        <div className="formularios-grid-wrapper">
          <div className="empty-state">
            <div className="empty-icon error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3>Error de conexión</h3>
            <p>{error}</p>
            <button className="empty-button" onClick={fetchFormularios}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="formularios-page">
      {/* Sticky Header Container */}
      <div className="formularios-sticky-header">
        {/* Header Card */}
        <div className="formularios-header-card">
          <div className="header-card-content">
            <div className="header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
                <path d="M9 12h6"/>
                <path d="M9 16h6"/>
              </svg>
            </div>
            <div className="header-text">
              <h1>Formularios</h1>
              <p>Completa tus formularios asignados</p>
            </div>
            <button className="refresh-button" onClick={handleRefresh} disabled={loading}>
              <svg className={loading ? 'spinning' : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="formularios-search">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar formularios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="formularios-tabs">
          <div className="tabs-container">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid with fade effect */}
      {filteredFormularios.length > 0 ? (
        <div className="formularios-container-card">
          <div className="formularios-grid-wrapper">
            <div className="formularios-grid">
          {filteredFormularios.map(form => (
            <div key={form.id} className="formulario-card" onClick={() => handleOpenForm(form.id, form.public_code)}>
              <div className="card-header">
                <div className="card-icon">{form.icon}</div>
                <button className="card-menu" onClick={(e) => e.stopPropagation()}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="12" cy="19" r="2"/>
                  </svg>
                </button>
              </div>
              
              <div className="card-content">
                <h3>{form.title}</h3>
                <p>{form.description}</p>
                
                <div className="card-meta">
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>{form.responses} respuestas</span>
                  </div>
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>{form.lastUpdated}</span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <span className={`card-status ${form.status}`}>
                  <svg width="8" height="8" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" fill="currentColor"/>
                  </svg>
                  {form.status === 'active' && 'Activo'}
                  {form.status === 'draft' && 'Borrador'}
                  {form.status === 'archived' && 'Archivado'}
                </span>
                <button className="card-button" onClick={(e) => { e.stopPropagation(); handleOpenForm(form.id, form.public_code) }}>
                  Abrir
                </button>
              </div>
            </div>
          ))}
          </div>
          </div>
        </div>
      ) : (
        <div className="formularios-container-card">
          <div className="formularios-grid-wrapper">
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h3>No hay formularios disponibles</h3>
            <p>No se encontraron formularios. Intenta ajustar los filtros o contacta a tu supervisor.</p>
          </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Services
