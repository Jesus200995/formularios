import { useState } from 'react'
import { 
  HiOutlineDocumentText, 
  HiOutlineCheckCircle, 
  HiOutlinePause, 
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineChatAlt,
  HiOutlineTicket,
  HiOutlineDocument,
  HiOutlinePlus,
  HiOutlineCalendar
} from 'react-icons/hi'

function Forms() {
  const [activeTab, setActiveTab] = useState('all')

  const forms = [
    { id: 1, name: 'Encuesta de Satisfacción', responses: 1250, status: 'active', created: '2026-01-15', type: 'survey' },
    { id: 2, name: 'Registro de Eventos', responses: 890, status: 'active', created: '2026-01-20', type: 'registration' },
    { id: 3, name: 'Feedback de Producto', responses: 654, status: 'paused', created: '2026-02-01', type: 'feedback' },
    { id: 4, name: 'Solicitud de Soporte', responses: 432, status: 'active', created: '2026-02-05', type: 'support' },
    { id: 5, name: 'Evaluación de Servicio', responses: 321, status: 'draft', created: '2026-02-10', type: 'survey' },
    { id: 6, name: 'Registro de Capacitación', responses: 198, status: 'active', created: '2026-02-12', type: 'registration' }
  ]

  const filteredForms = activeTab === 'all' 
    ? forms 
    : forms.filter(form => form.status === activeTab)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <span className="badge badge-success">Activo</span>
      case 'paused': return <span className="badge badge-warning">Pausado</span>
      case 'draft': return <span className="badge badge-info">Borrador</span>
      default: return <span className="badge">{status}</span>
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'survey': return <HiOutlineClipboardList size={32} />
      case 'registration': return <HiOutlineDocumentText size={32} />
      case 'feedback': return <HiOutlineChatAlt size={32} />
      case 'support': return <HiOutlineTicket size={32} />
      default: return <HiOutlineDocument size={32} />
    }
  }

  return (
    <div className="forms-page fade-in">
      <div className="page-header">
        <h1>Gestión de Formularios</h1>
        <p>Crea y administra los formularios de la aplicación</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card">
          <div className="stat-icon primary"><HiOutlineDocumentText size={24} /></div>
          <div className="stat-content">
            <h3>{forms.length}</h3>
            <p>Total Formularios</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><HiOutlineCheckCircle size={24} /></div>
          <div className="stat-content">
            <h3>{forms.filter(f => f.status === 'active').length}</h3>
            <p>Activos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><HiOutlinePause size={24} /></div>
          <div className="stat-content">
            <h3>{forms.filter(f => f.status === 'paused').length}</h3>
            <p>Pausados</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info"><HiOutlineChartBar size={24} /></div>
          <div className="stat-content">
            <h3>{forms.reduce((acc, f) => acc + f.responses, 0).toLocaleString()}</h3>
            <p>Total Respuestas</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            {['all', 'active', 'paused', 'draft'].map(tab => (
              <button
                key={tab}
                className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'all' ? 'Todos' : tab === 'active' ? 'Activos' : tab === 'paused' ? 'Pausados' : 'Borradores'}
              </button>
            ))}
          </div>
          <button className="btn btn-primary">
            <HiOutlinePlus size={16} /> Nuevo Formulario
          </button>
        </div>
        <div className="card-body">
          <div className="grid grid-3">
            {filteredForms.map(form => (
              <div key={form.id} className="card" style={{ border: '1px solid var(--gray-200)' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                    <span style={{ fontSize: '2rem' }}>{getTypeIcon(form.type)}</span>
                    {getStatusBadge(form.status)}
                  </div>
                  <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>{form.name}</h4>
                  <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>
                    <p style={{ margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><HiOutlineChartBar size={14} /> {form.responses} respuestas</p>
                    <p style={{ margin: '0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><HiOutlineCalendar size={14} /> Creado: {form.created}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button className="btn btn-sm btn-secondary" style={{ flex: 1 }}>Ver</button>
                    <button className="btn btn-sm btn-primary" style={{ flex: 1 }}>Editar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Forms
