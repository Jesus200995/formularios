import { useState, useEffect } from 'react'
import {
  HiOutlineArrowLeft,
  HiOutlineSave,
  HiOutlineEye,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineDuplicate,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineCog,
  HiOutlineMenuAlt2,
  HiOutlineHashtag,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlinePhotograph,
  HiOutlineMicrophone,
  HiOutlineVideoCamera,
  HiOutlinePaperClip,
  HiOutlineLocationMarker,
  HiOutlineStar,
  HiOutlineViewList,
  HiOutlineCheck,
  HiOutlineQrcode,
  HiOutlineLink,
  HiOutlineCalculator,
  HiOutlineInformationCircle,
  HiOutlineEyeOff,
  HiOutlineX,
  HiOutlineDocumentDuplicate
} from 'react-icons/hi'
import './FormBuilder.css'

const QUESTION_TYPES = [
  { type: 'text', label: 'Texto corto', icon: HiOutlineMenuAlt2, category: 'basic' },
  { type: 'textarea', label: 'Texto largo', icon: HiOutlineDocumentDuplicate, category: 'basic' },
  { type: 'email', label: 'Email', icon: HiOutlineMail, category: 'basic' },
  { type: 'phone', label: 'Teléfono', icon: HiOutlinePhone, category: 'basic' },
  { type: 'url', label: 'URL', icon: HiOutlineLink, category: 'basic' },
  { type: 'integer', label: 'Número entero', icon: HiOutlineHashtag, category: 'number' },
  { type: 'decimal', label: 'Decimal', icon: HiOutlineHashtag, category: 'number' },
  { type: 'range', label: 'Rango/Slider', icon: HiOutlineHashtag, category: 'number' },
  { type: 'select_one', label: 'Selección única', icon: HiOutlineCheck, category: 'choice' },
  { type: 'select_multiple', label: 'Selección múltiple', icon: HiOutlineViewList, category: 'choice' },
  { type: 'rating', label: 'Calificación', icon: HiOutlineStar, category: 'choice' },
  { type: 'date', label: 'Fecha', icon: HiOutlineCalendar, category: 'datetime' },
  { type: 'time', label: 'Hora', icon: HiOutlineClock, category: 'datetime' },
  { type: 'datetime', label: 'Fecha y hora', icon: HiOutlineCalendar, category: 'datetime' },
  { type: 'geopoint', label: 'Ubicación GPS', icon: HiOutlineLocationMarker, category: 'location' },
  { type: 'image', label: 'Imagen', icon: HiOutlinePhotograph, category: 'media' },
  { type: 'audio', label: 'Audio', icon: HiOutlineMicrophone, category: 'media' },
  { type: 'video', label: 'Video', icon: HiOutlineVideoCamera, category: 'media' },
  { type: 'file', label: 'Archivo', icon: HiOutlinePaperClip, category: 'media' },
  { type: 'barcode', label: 'Código QR/Barras', icon: HiOutlineQrcode, category: 'media' },
  { type: 'calculate', label: 'Calculado', icon: HiOutlineCalculator, category: 'advanced' },
  { type: 'note', label: 'Nota informativa', icon: HiOutlineInformationCircle, category: 'advanced' },
  { type: 'hidden', label: 'Campo oculto', icon: HiOutlineEyeOff, category: 'advanced' }
]

const CATEGORIES = [
  { key: 'basic', label: 'Básicos' },
  { key: 'number', label: 'Números' },
  { key: 'choice', label: 'Selección' },
  { key: 'datetime', label: 'Fecha/Hora' },
  { key: 'location', label: 'Ubicación' },
  { key: 'media', label: 'Multimedia' },
  { key: 'advanced', label: 'Avanzados' }
]

function FormBuilder({ form, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    questions: [],
    settings: {
      theme: 'default',
      show_progress: true,
      allow_save_draft: true,
      success_message: '¡Gracias por completar el formulario!'
    }
  })
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [showQuestionTypes, setShowQuestionTypes] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeCategory, setActiveCategory] = useState('basic')
  const [previewMode, setPreviewMode] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)

  useEffect(() => {
    if (form) {
      setFormData({
        ...form,
        questions: form.questions || [],
        settings: form.settings || {
          theme: 'default',
          show_progress: true,
          allow_save_draft: true,
          success_message: '¡Gracias por completar el formulario!'
        }
      })
    }
  }, [form])

  const addQuestion = (type) => {
    const typeInfo = QUESTION_TYPES.find(t => t.type === type)
    const newQuestion = {
      id: `q_${Date.now()}`,
      question_type: type,
      label: `Nueva pregunta ${typeInfo?.label || type}`,
      description: '',
      placeholder: '',
      required: false,
      order: formData.questions.length,
      options: type === 'select_one' || type === 'select_multiple' ? [
        { value: 'opcion1', label: 'Opción 1' },
        { value: 'opcion2', label: 'Opción 2' }
      ] : [],
      validation: {},
      min_value: type === 'rating' ? 1 : null,
      max_value: type === 'rating' ? 5 : null
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    })
    setSelectedQuestion(newQuestion.id)
    setShowQuestionTypes(false)
  }

  const updateQuestion = (questionId, updates) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    })
  }

  const deleteQuestion = (questionId) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== questionId)
    })
    if (selectedQuestion === questionId) {
      setSelectedQuestion(null)
    }
  }

  const duplicateQuestion = (question) => {
    const newQuestion = {
      ...question,
      id: `q_${Date.now()}`,
      label: `${question.label} (Copia)`,
      order: formData.questions.length
    }
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    })
  }

  const moveQuestion = (index, direction) => {
    const questions = [...formData.questions]
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= questions.length) return

    const temp = questions[index]
    questions[index] = questions[newIndex]
    questions[newIndex] = temp

    questions.forEach((q, i) => q.order = i)
    setFormData({ ...formData, questions })
  }

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const questions = [...formData.questions]
    const draggedItem = questions[draggedIndex]
    questions.splice(draggedIndex, 1)
    questions.splice(index, 0, draggedItem)
    questions.forEach((q, i) => q.order = i)
    
    setFormData({ ...formData, questions })
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      id: form?.id || Date.now(),
      created_at: form?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      submission_count: form?.submission_count || 0
    }
    onSave(dataToSave)
  }

  const getQuestionIcon = (type) => {
    const typeInfo = QUESTION_TYPES.find(t => t.type === type)
    return typeInfo ? <typeInfo.icon size={20} /> : <HiOutlineMenuAlt2 size={20} />
  }

  const selectedQuestionData = formData.questions.find(q => q.id === selectedQuestion)

  return (
    <div className="form-builder fade-in">
      {/* Header */}
      <div className="builder-header">
        <div className="header-left">
          <button className="btn btn-icon" onClick={onCancel}>
            <HiOutlineArrowLeft size={20} />
          </button>
          <div className="form-title-edit">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título del formulario"
              className="title-input"
            />
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción (opcional)"
              className="description-input"
            />
          </div>
        </div>
        <div className="header-right">
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="status-select"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
          <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>
            <HiOutlineCog size={18} />
          </button>
          <button className="btn btn-secondary" onClick={() => setPreviewMode(!previewMode)}>
            <HiOutlineEye size={18} /> Vista Previa
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <HiOutlineSave size={18} /> Guardar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="builder-content">
        {/* Questions Panel */}
        <div className="questions-panel">
          <div className="panel-header">
            <h3>Preguntas ({formData.questions.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowQuestionTypes(true)}>
              <HiOutlinePlus size={16} /> Agregar
            </button>
          </div>

          <div className="questions-list">
            {formData.questions.length === 0 ? (
              <div className="empty-questions">
                <HiOutlineDocumentDuplicate size={48} />
                <p>No hay preguntas</p>
                <button className="btn btn-primary" onClick={() => setShowQuestionTypes(true)}>
                  <HiOutlinePlus size={18} /> Agregar pregunta
                </button>
              </div>
            ) : (
              formData.questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`question-item ${selectedQuestion === question.id ? 'selected' : ''}`}
                  onClick={() => setSelectedQuestion(question.id)}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="question-drag-handle">
                    <span className="drag-dots">⋮⋮</span>
                  </div>
                  <div className="question-icon">
                    {getQuestionIcon(question.question_type)}
                  </div>
                  <div className="question-info">
                    <span className="question-label">{question.label}</span>
                    <span className="question-type">
                      {QUESTION_TYPES.find(t => t.type === question.question_type)?.label || question.question_type}
                      {question.required && <span className="required-badge">*</span>}
                    </span>
                  </div>
                  <div className="question-actions">
                    <button onClick={(e) => { e.stopPropagation(); moveQuestion(index, -1) }}>
                      <HiOutlineChevronUp size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); moveQuestion(index, 1) }}>
                      <HiOutlineChevronDown size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateQuestion(question) }}>
                      <HiOutlineDuplicate size={16} />
                    </button>
                    <button className="delete" onClick={(e) => { e.stopPropagation(); deleteQuestion(question.id) }}>
                      <HiOutlineTrash size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor Panel */}
        <div className="editor-panel">
          {selectedQuestionData ? (
            <QuestionEditor
              question={selectedQuestionData}
              onUpdate={(updates) => updateQuestion(selectedQuestion, updates)}
              onClose={() => setSelectedQuestion(null)}
            />
          ) : (
            <div className="no-selection">
              <HiOutlinePencil size={48} />
              <h3>Selecciona una pregunta</h3>
              <p>Haz clic en una pregunta de la lista para editarla</p>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {previewMode && (
          <div className="preview-panel">
            <div className="preview-header">
              <h3>Vista Previa</h3>
              <button onClick={() => setPreviewMode(false)}>
                <HiOutlineX size={20} />
              </button>
            </div>
            <div className="preview-content">
              <div className="preview-form">
                <h2>{formData.title || 'Sin título'}</h2>
                <p>{formData.description}</p>
                {formData.questions.map((q, i) => (
                  <div key={q.id} className="preview-question">
                    <label>
                      {i + 1}. {q.label}
                      {q.required && <span className="required">*</span>}
                    </label>
                    {renderPreviewInput(q)}
                  </div>
                ))}
                <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Question Types Modal */}
      {showQuestionTypes && (
        <div className="modal-overlay" onClick={() => setShowQuestionTypes(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Pregunta</h3>
              <button className="modal-close" onClick={() => setShowQuestionTypes(false)}>
                <HiOutlineX size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="question-types-tabs">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    className={`tab-btn ${activeCategory === cat.key ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.key)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="question-types-grid">
                {QUESTION_TYPES.filter(t => t.category === activeCategory).map(type => (
                  <button
                    key={type.type}
                    className="question-type-btn"
                    onClick={() => addQuestion(type.type)}
                  >
                    <type.icon size={24} />
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><HiOutlineCog size={24} /> Configuración del Formulario</h3>
              <button className="modal-close" onClick={() => setShowSettings(false)}>
                <HiOutlineX size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="settings-form">
                <div className="form-group">
                  <label>Tema</label>
                  <select
                    value={formData.settings.theme}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, theme: e.target.value }
                    })}
                  >
                    <option value="default">Por defecto</option>
                    <option value="modern">Moderno</option>
                    <option value="minimal">Minimalista</option>
                    <option value="dark">Oscuro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.settings.show_progress}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, show_progress: e.target.checked }
                      })}
                    />
                    <span>Mostrar barra de progreso</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.settings.allow_save_draft}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, allow_save_draft: e.target.checked }
                      })}
                    />
                    <span>Permitir guardar borrador</span>
                  </label>
                </div>
                <div className="form-group">
                  <label>Mensaje de éxito</label>
                  <textarea
                    value={formData.settings.success_message}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, success_message: e.target.value }
                    })}
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowSettings(false)}>
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function QuestionEditor({ question, onUpdate, onClose }) {
  const hasOptions = ['select_one', 'select_multiple', 'rating', 'ranking'].includes(question.question_type)

  const addOption = () => {
    const newOptions = [
      ...(question.options || []),
      { value: `opcion${(question.options?.length || 0) + 1}`, label: `Opción ${(question.options?.length || 0) + 1}` }
    ]
    onUpdate({ options: newOptions })
  }

  const updateOption = (index, field, value) => {
    const newOptions = question.options.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt
    )
    onUpdate({ options: newOptions })
  }

  const removeOption = (index) => {
    const newOptions = question.options.filter((_, i) => i !== index)
    onUpdate({ options: newOptions })
  }

  return (
    <div className="question-editor">
      <div className="editor-header">
        <h3>Editar Pregunta</h3>
        <button onClick={onClose}><HiOutlineX size={20} /></button>
      </div>

      <div className="editor-body">
        <div className="form-group">
          <label>Etiqueta de la pregunta</label>
          <input
            type="text"
            value={question.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Escribe la pregunta"
          />
        </div>

        <div className="form-group">
          <label>Descripción / Ayuda (opcional)</label>
          <textarea
            value={question.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Texto de ayuda para el usuario"
            rows={2}
          />
        </div>

        <div className="form-group">
          <label>Placeholder (opcional)</label>
          <input
            type="text"
            value={question.placeholder || ''}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            placeholder="Texto de ejemplo"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
            />
            <span>Campo obligatorio</span>
          </label>
        </div>

        {/* Options for select/rating */}
        {hasOptions && (
          <div className="form-group options-group">
            <label>Opciones</label>
            <div className="options-list">
              {(question.options || []).map((option, index) => (
                <div key={index} className="option-item">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                    placeholder="Etiqueta"
                  />
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => updateOption(index, 'value', e.target.value)}
                    placeholder="Valor"
                    className="option-value"
                  />
                  <button className="remove-option" onClick={() => removeOption(index)}>
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={addOption}>
                <HiOutlinePlus size={16} /> Agregar opción
              </button>
            </div>
          </div>
        )}

        {/* Range/Rating settings */}
        {['range', 'rating'].includes(question.question_type) && (
          <div className="form-row">
            <div className="form-group">
              <label>Valor mínimo</label>
              <input
                type="number"
                value={question.min_value || 1}
                onChange={(e) => onUpdate({ min_value: parseInt(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Valor máximo</label>
              <input
                type="number"
                value={question.max_value || 5}
                onChange={(e) => onUpdate({ max_value: parseInt(e.target.value) })}
              />
            </div>
          </div>
        )}

        {/* Validation */}
        <div className="validation-section">
          <h4>Validación</h4>
          {['text', 'textarea', 'email', 'phone'].includes(question.question_type) && (
            <div className="form-row">
              <div className="form-group">
                <label>Longitud mínima</label>
                <input
                  type="number"
                  value={question.validation?.min_length || ''}
                  onChange={(e) => onUpdate({
                    validation: { ...question.validation, min_length: parseInt(e.target.value) || null }
                  })}
                />
              </div>
              <div className="form-group">
                <label>Longitud máxima</label>
                <input
                  type="number"
                  value={question.validation?.max_length || ''}
                  onChange={(e) => onUpdate({
                    validation: { ...question.validation, max_length: parseInt(e.target.value) || null }
                  })}
                />
              </div>
            </div>
          )}
          {['integer', 'decimal'].includes(question.question_type) && (
            <div className="form-row">
              <div className="form-group">
                <label>Valor mínimo</label>
                <input
                  type="number"
                  value={question.validation?.min || ''}
                  onChange={(e) => onUpdate({
                    validation: { ...question.validation, min: parseFloat(e.target.value) || null }
                  })}
                />
              </div>
              <div className="form-group">
                <label>Valor máximo</label>
                <input
                  type="number"
                  value={question.validation?.max || ''}
                  onChange={(e) => onUpdate({
                    validation: { ...question.validation, max: parseFloat(e.target.value) || null }
                  })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function renderPreviewInput(question) {
  switch (question.question_type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
      return <input type="text" placeholder={question.placeholder} />
    case 'textarea':
      return <textarea placeholder={question.placeholder} rows={3} />
    case 'integer':
    case 'decimal':
      return <input type="number" placeholder={question.placeholder} />
    case 'date':
      return <input type="date" />
    case 'time':
      return <input type="time" />
    case 'datetime':
      return <input type="datetime-local" />
    case 'select_one':
      return (
        <div className="preview-options">
          {(question.options || []).map((opt, i) => (
            <label key={i} className="radio-option">
              <input type="radio" name={question.id} /> {opt.label}
            </label>
          ))}
        </div>
      )
    case 'select_multiple':
      return (
        <div className="preview-options">
          {(question.options || []).map((opt, i) => (
            <label key={i} className="checkbox-option">
              <input type="checkbox" /> {opt.label}
            </label>
          ))}
        </div>
      )
    case 'rating':
      return (
        <div className="preview-rating">
          {Array.from({ length: question.max_value || 5 }, (_, i) => (
            <span key={i} className="star">★</span>
          ))}
        </div>
      )
    case 'geopoint':
      return <button className="btn btn-secondary">Obtener ubicación GPS</button>
    case 'image':
    case 'file':
      return <input type="file" />
    case 'note':
      return <p className="note-text">{question.description}</p>
    default:
      return <input type="text" placeholder={question.placeholder} />
  }
}

export default FormBuilder
