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
    if (titleLower.includes('cultivo') || titleLower.includes('siembra')) return '🌱'
    if (titleLower.includes('producción') || titleLower.includes('cosecha')) return '📋'
    if (titleLower.includes('censo') || titleLower.includes('población')) return '👥'
    if (titleLower.includes('familia') || titleLower.includes('hogar')) return '🏠'
    if (titleLower.includes('plaga') || titleLower.includes('control')) return '🌾'
    if (titleLower.includes('apoyo') || titleLower.includes('solicitud')) return '💰'
    if (titleLower.includes('salud') || titleLower.includes('médico')) return '🏥'
    if (titleLower.includes('educación') || titleLower.includes('escuela')) return '📚'
    return '📝'
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

  const handleCreateNew = () => {
    console.log('Crear nuevo formulario - Solo para administradores')
  }

  const handleOpenForm = (formId, publicCode) => {
    navigate(`/formulario/${publicCode || formId}`)
  }

  if (loading) {
    return (
      <div className="formularios-page">
        <div className="formularios-hero">
          <h1>Formularios</h1>
          <p>Cargando formularios disponibles...</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <h3>Cargando...</h3>
          <p>Por favor espera un momento</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="formularios-page">
        <div className="formularios-hero">
          <h1>Formularios</h1>
          <p>Error al cargar formularios</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Error de conexión</h3>
          <p>{error}</p>
          <button className="empty-button" onClick={fetchFormularios}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="formularios-page">
      {/* Hero */}
      <div className="formularios-hero">
        <h1>Formularios</h1>
        <p>Gestiona y completa tus formularios de manera eficiente</p>
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

      {/* Grid */}
      {filteredFormularios.length > 0 ? (
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
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No se encontraron formularios</h3>
          <p>Intenta ajustar los filtros o crea un nuevo formulario</p>
          <button className="empty-button" onClick={handleCreateNew}>
            Crear Formulario
          </button>
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={handleCreateNew} aria-label="Crear nuevo formulario">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  )
}

export default Services
