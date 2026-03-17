import { useState } from 'react'
import './Formularios.css'

function Services() {
  const [activeTab, setActiveTab] = useState('todos')
  const [searchQuery, setSearchQuery] = useState('')

  const formularios = [
    {
      id: 1,
      icon: '🌱',
      title: 'Registro de Cultivos',
      description: 'Formulario para registro y monitoreo de cultivos agrícolas',
      responses: 124,
      lastUpdated: 'Hace 2 horas',
      status: 'active'
    },
    {
      id: 2,
      icon: '📋',
      title: 'Evaluación de Producción',
      description: 'Evaluación mensual de producción y rendimiento',
      responses: 87,
      lastUpdated: 'Hace 5 horas',
      status: 'active'
    },
    {
      id: 3,
      icon: '👥',
      title: 'Censo Comunitario',
      description: 'Recolección de datos demográficos de la comunidad',
      responses: 342,
      lastUpdated: 'Hace 1 día',
      status: 'active'
    },
    {
      id: 4,
      icon: '🏠',
      title: 'Registro de Familias',
      description: 'Información básica de familias beneficiarias',
      responses: 0,
      lastUpdated: 'Hace 3 días',
      status: 'draft'
    },
    {
      id: 5,
      icon: '🌾',
      title: 'Control de Plagas',
      description: 'Monitoreo y reporte de plagas en cultivos',
      responses: 56,
      lastUpdated: 'Hace 1 semana',
      status: 'active'
    },
    {
      id: 6,
      icon: '💰',
      title: 'Solicitud de Apoyos',
      description: 'Formulario para solicitud de apoyos económicos',
      responses: 198,
      lastUpdated: 'Hace 2 semanas',
      status: 'archived'
    }
  ]

  const tabs = [
    { id: 'todos', label: 'Todos', count: formularios.length },
    { id: 'active', label: 'Activos', count: formularios.filter(f => f.status === 'active').length },
    { id: 'draft', label: 'Borradores', count: formularios.filter(f => f.status === 'draft').length },
    { id: 'archived', label: 'Archivados', count: formularios.filter(f => f.status === 'archived').length }
  ]

  const filteredFormularios = formularios.filter(form => {
    const matchesTab = activeTab === 'todos' || form.status === activeTab
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const handleCreateNew = () => {
    console.log('Crear nuevo formulario')
  }

  const handleOpenForm = (formId) => {
    console.log('Abrir formulario:', formId)
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
            <div key={form.id} className="formulario-card" onClick={() => handleOpenForm(form.id)}>
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
                <button className="card-button" onClick={(e) => { e.stopPropagation(); handleOpenForm(form.id) }}>
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
