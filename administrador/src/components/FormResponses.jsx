import { useState, useEffect } from 'react'
import {
  HiOutlineArrowLeft,
  HiOutlineDownload,
  HiOutlineRefresh,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineTable,
  HiOutlineDocumentReport,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from 'react-icons/hi'
import './FormResponses.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://apidata.geodatos.com.mx/api'

function FormResponses({ form, onBack }) {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('table') // table, detail, chart
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showExportModal, setShowExportModal] = useState(false)
  const [dateFilter, setDateFilter] = useState({ from: '', to: '' })

  const getAuthToken = () => localStorage.getItem('authToken')

  useEffect(() => {
    fetchSubmissions()
  }, [form, page, dateFilter])

  const fetchSubmissions = async () => {
    const token = getAuthToken()
    
    try {
      setLoading(true)
      const params = new URLSearchParams({
        skip: (page - 1) * 20,
        limit: 20
      })
      
      if (dateFilter.from) params.append('date_from', dateFilter.from)
      if (dateFilter.to) params.append('date_to', dateFilter.to)

      const response = await fetch(`${API_URL}/submissions/forms/${form.id}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
        setTotalPages(Math.ceil((form.submission_count || data.length) / 20))
      } else {
        // Mock data
        setSubmissions(getMockSubmissions())
      }
    } catch (err) {
      console.error('Error fetching submissions:', err)
      setSubmissions(getMockSubmissions())
    } finally {
      setLoading(false)
    }
  }

  const getMockSubmissions = () => {
    const mockData = []
    for (let i = 1; i <= 10; i++) {
      mockData.push({
        id: i,
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        status: 'completed',
        user_id: null,
        answers: [
          { question_id: 1, value_text: `Respuesta ${i}` },
          { question_id: 2, value_number: Math.floor(Math.random() * 5) + 1 },
          { question_id: 3, value_text: 'opcion1' }
        ]
      })
    }
    return mockData
  }

  const handleExport = async (format) => {
    const token = getAuthToken()
    
    try {
      const response = await fetch(`${API_URL}/submissions/forms/${form.id}/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          include_metadata: true,
          date_from: dateFilter.from || null,
          date_to: dateFilter.to || null
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${form.title}_export.${format}`
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        alert('Error al exportar. Intente de nuevo.')
      }
    } catch (err) {
      console.error('Export error:', err)
      // Mock export
      alert(`Exportando a ${format.toUpperCase()}...`)
    }

    setShowExportModal(false)
  }

  const handleDelete = async (submissionId) => {
    if (!confirm('¿Eliminar esta respuesta?')) return
    
    const token = getAuthToken()
    try {
      await fetch(`${API_URL}/submissions/${submissionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setSubmissions(submissions.filter(s => s.id !== submissionId))
    } catch (err) {
      console.error('Delete error:', err)
      setSubmissions(submissions.filter(s => s.id !== submissionId))
    }
  }

  const getAnswerValue = (submission, questionIndex) => {
    const answer = submission.answers?.find(a => a.question_id === questionIndex + 1)
    if (!answer) return '-'
    return answer.value_text || answer.value_number || JSON.stringify(answer.value_json) || '-'
  }

  // Stats calculation
  const stats = {
    total: form.submission_count || submissions.length,
    today: submissions.filter(s => {
      const date = new Date(s.created_at)
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }).length,
    thisWeek: submissions.filter(s => {
      const date = new Date(s.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    }).length
  }

  return (
    <div className="form-responses fade-in">
      {/* Header */}
      <div className="responses-header">
        <div className="header-left">
          <button className="btn btn-icon" onClick={onBack}>
            <HiOutlineArrowLeft size={20} />
          </button>
          <div>
            <h1>{form.title}</h1>
            <p>Respuestas del formulario</p>
          </div>
        </div>
        <div className="header-right">
          <button className="btn btn-secondary" onClick={fetchSubmissions}>
            <HiOutlineRefresh size={18} />
          </button>
          <button className="btn btn-primary" onClick={() => setShowExportModal(true)}>
            <HiOutlineDownload size={18} /> Exportar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="responses-stats">
        <div className="stat-item">
          <HiOutlineChartBar size={24} />
          <div>
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="stat-item">
          <HiOutlineCalendar size={24} />
          <div>
            <span className="stat-value">{stats.today}</span>
            <span className="stat-label">Hoy</span>
          </div>
        </div>
        <div className="stat-item">
          <HiOutlineDocumentReport size={24} />
          <div>
            <span className="stat-value">{stats.thisWeek}</span>
            <span className="stat-label">Esta semana</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="responses-filters">
        <div className="filter-group">
          <label>Desde:</label>
          <input
            type="date"
            value={dateFilter.from}
            onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>Hasta:</label>
          <input
            type="date"
            value={dateFilter.to}
            onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })}
          />
        </div>
        <div className="view-toggle">
          <button
            className={view === 'table' ? 'active' : ''}
            onClick={() => setView('table')}
          >
            <HiOutlineTable size={18} />
          </button>
          <button
            className={view === 'chart' ? 'active' : ''}
            onClick={() => setView('chart')}
          >
            <HiOutlineChartBar size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="responses-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando respuestas...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="empty-state">
            <HiOutlineDocumentReport size={64} />
            <h3>Sin respuestas</h3>
            <p>Este formulario aún no tiene respuestas</p>
          </div>
        ) : view === 'table' ? (
          <>
            <div className="responses-table-container">
              <table className="responses-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    {(form.questions || []).slice(0, 4).map((q, i) => (
                      <th key={i}>{q.label?.substring(0, 30) || `Pregunta ${i + 1}`}</th>
                    ))}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub, idx) => (
                    <tr key={sub.id}>
                      <td>{(page - 1) * 20 + idx + 1}</td>
                      <td>{new Date(sub.created_at).toLocaleString('es-MX')}</td>
                      <td>
                        <span className={`status-badge ${sub.status}`}>
                          {sub.status === 'completed' ? 'Completado' : sub.status}
                        </span>
                      </td>
                      {(form.questions || []).slice(0, 4).map((q, i) => (
                        <td key={i}>{getAnswerValue(sub, i)}</td>
                      ))}
                      <td>
                        <div className="table-actions">
                          <button onClick={() => setSelectedSubmission(sub)}>
                            <HiOutlineEye size={16} />
                          </button>
                          <button className="danger" onClick={() => handleDelete(sub.id)}>
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <HiOutlineChevronLeft size={18} />
              </button>
              <span>Página {page} de {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <HiOutlineChevronRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="chart-view">
            <h3>Análisis de Respuestas</h3>
            <p>Visualización de datos próximamente...</p>
            <div className="chart-placeholder">
              <HiOutlineChartBar size={64} />
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Respuesta #{selectedSubmission.id}</h3>
              <button className="modal-close" onClick={() => setSelectedSubmission(null)}>
                <HiOutlineX size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="submission-meta">
                <p><strong>Fecha:</strong> {new Date(selectedSubmission.created_at).toLocaleString('es-MX')}</p>
                <p><strong>Estado:</strong> {selectedSubmission.status}</p>
              </div>
              <div className="submission-answers">
                <h4>Respuestas</h4>
                {selectedSubmission.answers?.map((answer, i) => {
                  const question = form.questions?.[answer.question_id - 1]
                  return (
                    <div key={i} className="answer-item">
                      <label>{question?.label || `Pregunta ${answer.question_id}`}</label>
                      <p>{answer.value_text || answer.value_number || JSON.stringify(answer.value_json) || '-'}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><HiOutlineDownload size={24} /> Exportar Datos</h3>
              <button className="modal-close" onClick={() => setShowExportModal(false)}>
                <HiOutlineX size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p>Selecciona el formato de exportación:</p>
              <div className="export-options">
                <button className="export-btn" onClick={() => handleExport('xlsx')}>
                  <span className="export-icon">📊</span>
                  <span className="export-label">Excel (.xlsx)</span>
                </button>
                <button className="export-btn" onClick={() => handleExport('csv')}>
                  <span className="export-icon">📄</span>
                  <span className="export-label">CSV (.csv)</span>
                </button>
                <button className="export-btn" onClick={() => handleExport('json')}>
                  <span className="export-icon">{ }</span>
                  <span className="export-label">JSON (.json)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FormResponses
