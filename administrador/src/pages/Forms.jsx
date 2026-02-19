import { useState, useEffect, useCallback } from 'react'
import { 
  HiOutlineDocumentText, 
  HiOutlineCheckCircle, 
  HiOutlinePause, 
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlinePlus,
  HiOutlineCalendar,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineDuplicate,
  HiOutlineSearch,
  HiOutlineTemplate,
  HiOutlineShare,
  HiOutlineLink,
  HiOutlineX,
  HiOutlineExclamationCircle
} from 'react-icons/hi'
import FormBuilder from '../components/FormBuilder'
import FormResponses from '../components/FormResponses'
import FormPreview from '../components/FormPreview'
import './Forms.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://apidata.geodatos.com.mx/api'

function Forms() {
  const [activeTab, setActiveTab] = useState('all')
  const [view, setView] = useState('list')
  const [forms, setForms] = useState([])
  const [selectedForm, setSelectedForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [templates, setTemplates] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formToDelete, setFormToDelete] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareForm, setShareForm] = useState(null)

  const getAuthToken = () => localStorage.getItem('authToken')

  const fetchForms = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setForms(getMockForms())
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/forms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setForms(data)
      } else {
        setForms(getMockForms())
      }
    } catch (err) {
      console.error('Error fetching forms:', err)
      setForms(getMockForms())
    } finally {
      setLoading(false)
    }
  }, [])

  const getMockForms = () => [
    { id: 1, title: 'Encuesta de Satisfacción', description: 'Evalúa la satisfacción del cliente', status: 'published', submission_count: 1250, created_at: '2026-01-15T10:00:00Z' },
    { id: 2, title: 'Registro de Eventos', description: 'Formulario de inscripción', status: 'published', submission_count: 890, created_at: '2026-01-20T09:00:00Z' },
    { id: 3, title: 'Feedback de Producto', description: 'Opiniones sobre el producto', status: 'draft', submission_count: 654, created_at: '2026-02-01T15:00:00Z' },
    { id: 4, title: 'Solicitud de Soporte', description: 'Ticket de soporte técnico', status: 'published', submission_count: 432, created_at: '2026-02-05T08:00:00Z' },
    { id: 5, title: 'Evaluación de Personal', description: 'Evaluación trimestral', status: 'archived', submission_count: 321, created_at: '2026-02-10T12:00:00Z' },
    { id: 6, title: 'Encuesta de Campo', description: 'Recolección de datos GPS', status: 'published', submission_count: 198, created_at: '2026-02-12T14:00:00Z' }
  ]

  const fetchTemplates = async () => {
    setTemplates([
      { id: -1, name: 'Encuesta de Satisfacción', description: 'Evalúa la satisfacción de tus clientes', category: 'feedback', template_data: { questions: [] } },
      { id: -2, name: 'Registro de Evento', description: 'Inscripción para eventos', category: 'events', template_data: { questions: [] } },
      { id: -3, name: 'Formulario de Contacto', description: 'Recibe mensajes de visitantes', category: 'contact', template_data: { questions: [] } },
      { id: -4, name: 'Encuesta de Campo', description: 'Recolección con GPS', category: 'field', template_data: { questions: [] } },
      { id: -5, name: 'Evaluación de Personal', description: 'Evaluación de desempeño', category: 'hr', template_data: { questions: [] } },
      { id: -6, name: 'Solicitud de Servicio', description: 'Tickets de soporte', category: 'support', template_data: { questions: [] } }
    ])
  }

  useEffect(() => { fetchForms() }, [fetchForms])

  const filteredForms = forms.filter(form => {
    const matchesTab = activeTab === 'all' || form.status === activeTab
    const matchesSearch = !searchQuery || form.title?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const stats = {
    total: forms.length,
    published: forms.filter(f => f.status === 'published').length,
    draft: forms.filter(f => f.status === 'draft').length,
    responses: forms.reduce((acc, f) => acc + (f.submission_count || 0), 0)
  }

  const getStatusBadge = (status) => {
    const badges = {
      published: <span className="badge badge-success">Publicado</span>,
      draft: <span className="badge badge-warning">Borrador</span>,
      archived: <span className="badge badge-secondary">Archivado</span>
    }
    return badges[status] || <span className="badge">{status}</span>
  }

  const handleCreateNew = () => { setSelectedForm(null); setView('builder') }
  const handleCreateFromTemplate = (template) => {
    setShowTemplates(false)
    setSelectedForm({ ...template.template_data, id: null, title: template.name, description: template.description, status: 'draft' })
    setView('builder')
  }
  const handleEdit = (form) => { setSelectedForm(form); setView('builder') }
  const handleViewResponses = (form) => { setSelectedForm(form); setView('responses') }
  const handlePreview = (form) => { setSelectedForm(form); setView('preview') }
  const handleDelete = async () => {
    if (!formToDelete) return
    setForms(forms.filter(f => f.id !== formToDelete.id))
    setShowDeleteModal(false)
    setFormToDelete(null)
  }
  const handleDuplicate = (form) => {
    const newForm = { ...form, id: Date.now(), title: `${form.title} (Copia)`, status: 'draft', submission_count: 0, created_at: new Date().toISOString() }
    setForms([newForm, ...forms])
  }
  const handleShare = (form) => { setShareForm(form); setShowShareModal(true) }
  const copyShareLink = () => {
    navigator.clipboard.writeText(`https://data.geodatos.com.mx/form/${shareForm?.id}`)
    alert('Enlace copiado al portapapeles')
  }
  const handleFormSaved = (savedForm) => {
    if (selectedForm?.id) setForms(forms.map(f => f.id === savedForm.id ? savedForm : f))
    else setForms([savedForm, ...forms])
    setView('list')
  }

  if (view === 'builder') return <FormBuilder form={selectedForm} onSave={handleFormSaved} onCancel={() => setView('list')} />
  if (view === 'responses') return <FormResponses form={selectedForm} onBack={() => setView('list')} />
  if (view === 'preview') return <FormPreview form={selectedForm} onBack={() => setView('list')} />

  return (
    <div className="forms-page fade-in">
      <div className="page-header">
        <div>
          <h1>Gestión de Formularios</h1>
          <p>Crea, edita y administra formularios como en KoboToolbox</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => { fetchTemplates(); setShowTemplates(true) }}>
            <HiOutlineTemplate size={18} /> Plantillas
          </button>
          <button className="btn btn-primary" onClick={handleCreateNew}>
            <HiOutlinePlus size={18} /> Nuevo Formulario
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><HiOutlineDocumentText size={24} /></div>
          <div className="stat-content"><h3>{stats.total}</h3><p>Total Formularios</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><HiOutlineCheckCircle size={24} /></div>
          <div className="stat-content"><h3>{stats.published}</h3><p>Publicados</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><HiOutlinePause size={24} /></div>
          <div className="stat-content"><h3>{stats.draft}</h3><p>Borradores</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info"><HiOutlineChartBar size={24} /></div>
          <div className="stat-content"><h3>{stats.responses.toLocaleString()}</h3><p>Total Respuestas</p></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-filters">
            <div className="search-box">
              <HiOutlineSearch size={20} />
              <input type="text" placeholder="Buscar formularios..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="tab-filters">
              {[{ key: 'all', label: 'Todos' }, { key: 'published', label: 'Publicados' }, { key: 'draft', label: 'Borradores' }, { key: 'archived', label: 'Archivados' }].map(tab => (
                <button key={tab.key} className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                  {tab.label}
                  {tab.key !== 'all' && <span className="tab-count">{forms.filter(f => f.status === tab.key).length}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading-state"><div className="spinner"></div><p>Cargando formularios...</p></div>
          ) : filteredForms.length === 0 ? (
            <div className="empty-state">
              <HiOutlineDocumentText size={64} />
              <h3>No hay formularios</h3>
              <p>Crea tu primer formulario o usa una plantilla</p>
              <button className="btn btn-primary" onClick={handleCreateNew}><HiOutlinePlus size={18} /> Crear Formulario</button>
            </div>
          ) : (
            <div className="forms-grid">
              {filteredForms.map(form => (
                <div key={form.id} className="form-card">
                  <div className="form-card-header">
                    <div className="form-icon"><HiOutlineClipboardList size={28} /></div>
                    {getStatusBadge(form.status)}
                  </div>
                  <div className="form-card-body">
                    <h4>{form.title}</h4>
                    <p className="form-description">{form.description || 'Sin descripción'}</p>
                    <div className="form-meta">
                      <span><HiOutlineChartBar size={16} />{form.submission_count || 0} respuestas</span>
                      <span><HiOutlineCalendar size={16} />{new Date(form.created_at).toLocaleDateString('es-MX')}</span>
                    </div>
                  </div>
                  <div className="form-card-actions">
                    <button className="action-btn" title="Ver respuestas" onClick={() => handleViewResponses(form)}><HiOutlineChartBar size={18} /></button>
                    <button className="action-btn" title="Vista previa" onClick={() => handlePreview(form)}><HiOutlineEye size={18} /></button>
                    <button className="action-btn" title="Editar" onClick={() => handleEdit(form)}><HiOutlinePencil size={18} /></button>
                    <button className="action-btn" title="Compartir" onClick={() => handleShare(form)}><HiOutlineShare size={18} /></button>
                    <button className="action-btn" title="Duplicar" onClick={() => handleDuplicate(form)}><HiOutlineDuplicate size={18} /></button>
                    <button className="action-btn danger" title="Eliminar" onClick={() => { setFormToDelete(form); setShowDeleteModal(true) }}><HiOutlineTrash size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showTemplates && (
        <div className="modal-overlay" onClick={() => setShowTemplates(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><HiOutlineTemplate size={24} /> Plantillas de Formulario</h3>
              <button className="modal-close" onClick={() => setShowTemplates(false)}><HiOutlineX size={24} /></button>
            </div>
            <div className="modal-body">
              <p className="modal-description">Selecciona una plantilla para empezar rápidamente</p>
              <div className="templates-grid">
                {templates.map(template => (
                  <div key={template.id} className="template-card" onClick={() => handleCreateFromTemplate(template)}>
                    <div className="template-icon"><HiOutlineDocumentText size={32} /></div>
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                    <span className="template-category">{template.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content small" onClick={e => e.stopPropagation()}>
            <div className="modal-header danger"><h3><HiOutlineExclamationCircle size={24} /> Confirmar Eliminación</h3></div>
            <div className="modal-body">
              <p>¿Estás seguro de eliminar el formulario <strong>"{formToDelete?.title}"</strong>?</p>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><HiOutlineShare size={24} /> Compartir Formulario</h3>
              <button className="modal-close" onClick={() => setShowShareModal(false)}><HiOutlineX size={24} /></button>
            </div>
            <div className="modal-body">
              <p>Comparte este enlace:</p>
              <div className="share-link-box">
                <input type="text" value={`https://data.geodatos.com.mx/form/${shareForm?.id}`} readOnly />
                <button className="btn btn-primary" onClick={copyShareLink}><HiOutlineLink size={18} /> Copiar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Forms
