import { useState } from 'react'
import {
  HiOutlineArrowLeft,
  HiOutlineDesktopComputer,
  HiOutlineDeviceMobile,
  HiOutlineShare,
  HiOutlineCheck,
  HiOutlineExclamation,
  HiOutlinePhotograph,
  HiOutlineMicrophone,
  HiOutlineCamera,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlinePencil,
  HiOutlineStar
} from 'react-icons/hi'
import './FormPreview.css'

function FormPreview({ form, onBack }) {
  const [device, setDevice] = useState('desktop')
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const questions = form.questions || []
  
  // Group questions by page (for multi-page forms)
  const pages = questions.reduce((acc, q, idx) => {
    const pageIdx = q.page || 0
    if (!acc[pageIdx]) acc[pageIdx] = []
    acc[pageIdx].push({ ...q, index: idx })
    return acc
  }, [[]])

  const currentQuestions = pages[currentPage] || pages[0] || []

  const handleAnswer = (questionIndex, value) => {
    setAnswers({ ...answers, [questionIndex]: value })
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const renderQuestion = (question) => {
    const value = answers[question.index] || ''

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={question.placeholder || 'Escribe tu respuesta...'}
            value={value}
            onChange={(e) => handleAnswer(question.index, e.target.value)}
          />
        )
      
      case 'textarea':
        return (
          <textarea
            placeholder={question.placeholder || 'Escribe tu respuesta...'}
            value={value}
            onChange={(e) => handleAnswer(question.index, e.target.value)}
            rows={4}
          />
        )
      
      case 'number':
        return (
          <input
            type="number"
            placeholder="0"
            value={value}
            onChange={(e) => handleAnswer(question.index, e.target.value)}
          />
        )
      
      case 'email':
        return (
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={value}
            onChange={(e) => handleAnswer(question.index, e.target.value)}
          />
        )
      
      case 'phone':
        return (
          <input
            type="tel"
            placeholder="+52 123 456 7890"
            value={value}
            onChange={(e) => handleAnswer(question.index, e.target.value)}
          />
        )
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleAnswer(question.index, e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            {(question.options || []).map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )
      
      case 'radio':
        return (
          <div className="radio-group">
            {(question.options || []).map((opt, i) => (
              <label key={i} className="radio-option">
                <input
                  type="radio"
                  name={`q-${question.index}`}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => handleAnswer(question.index, e.target.value)}
                />
                <span className="radio-custom"></span>
                {opt.label}
              </label>
            ))}
          </div>
        )
      
      case 'checkbox':
        return (
          <div className="checkbox-group">
            {(question.options || []).map((opt, i) => (
              <label key={i} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={(value || []).includes(opt.value)}
                  onChange={(e) => {
                    const current = value || []
                    if (e.target.checked) {
                      handleAnswer(question.index, [...current, opt.value])
                    } else {
                      handleAnswer(question.index, current.filter(v => v !== opt.value))
                    }
                  }}
                />
                <span className="checkbox-custom"></span>
                {opt.label}
              </label>
            ))}
          </div>
        )
      
      case 'date':
        return (
          <div className="date-input">
            <HiOutlineCalendar size={20} />
            <input
              type="date"
              value={value}
              onChange={(e) => handleAnswer(question.index, e.target.value)}
            />
          </div>
        )
      
      case 'time':
        return (
          <div className="time-input">
            <HiOutlineClock size={20} />
            <input
              type="time"
              value={value}
              onChange={(e) => handleAnswer(question.index, e.target.value)}
            />
          </div>
        )
      
      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => handleAnswer(question.index, e.target.value)}
          />
        )
      
      case 'rating':
        const maxRating = question.max_value || 5
        return (
          <div className="rating-input">
            {[...Array(maxRating)].map((_, i) => (
              <button
                key={i}
                type="button"
                className={`star ${value > i ? 'active' : ''}`}
                onClick={() => handleAnswer(question.index, i + 1)}
              >
                <HiOutlineStar size={28} />
              </button>
            ))}
          </div>
        )
      
      case 'scale':
        const min = question.min_value || 1
        const max = question.max_value || 10
        return (
          <div className="scale-input">
            <span>{min}</span>
            <div className="scale-options">
              {[...Array(max - min + 1)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`scale-option ${value === min + i ? 'active' : ''}`}
                  onClick={() => handleAnswer(question.index, min + i)}
                >
                  {min + i}
                </button>
              ))}
            </div>
            <span>{max}</span>
          </div>
        )
      
      case 'image':
        return (
          <div className="file-input">
            <HiOutlinePhotograph size={32} />
            <p>Haz clic para subir una imagen</p>
            <input type="file" accept="image/*" />
          </div>
        )
      
      case 'audio':
        return (
          <div className="file-input audio">
            <HiOutlineMicrophone size={32} />
            <p>Grabar audio</p>
          </div>
        )
      
      case 'video':
        return (
          <div className="file-input video">
            <HiOutlineCamera size={32} />
            <p>Grabar video</p>
          </div>
        )
      
      case 'gps':
        return (
          <div className="gps-input">
            <HiOutlineLocationMarker size={32} />
            <p>Obtener ubicación</p>
            <button type="button">Capturar GPS</button>
          </div>
        )
      
      case 'signature':
        return (
          <div className="signature-input">
            <HiOutlinePencil size={24} />
            <p>Área de firma</p>
          </div>
        )
      
      case 'note':
        return (
          <div className="note-display">
            <p>{question.description}</p>
          </div>
        )
      
      default:
        return (
          <input
            type="text"
            placeholder="Respuesta..."
            value={value}
            onChange={(e) => handleAnswer(question.index, e.target.value)}
          />
        )
    }
  }

  return (
    <div className="form-preview fade-in">
      {/* Header */}
      <div className="preview-header">
        <div className="header-left">
          <button className="btn btn-icon" onClick={onBack}>
            <HiOutlineArrowLeft size={20} />
          </button>
          <div>
            <h1>Vista previa</h1>
            <p>{form.title}</p>
          </div>
        </div>
        <div className="header-right">
          <div className="device-toggle">
            <button
              className={device === 'desktop' ? 'active' : ''}
              onClick={() => setDevice('desktop')}
            >
              <HiOutlineDesktopComputer size={20} />
            </button>
            <button
              className={device === 'mobile' ? 'active' : ''}
              onClick={() => setDevice('mobile')}
            >
              <HiOutlineDeviceMobile size={20} />
            </button>
          </div>
          <button className="btn btn-secondary">
            <HiOutlineShare size={18} /> Compartir
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className={`preview-container ${device}`}>
        <div className="preview-device">
          {device === 'mobile' && <div className="device-notch"></div>}
          
          <div className="form-content">
            {submitted ? (
              <div className="success-message">
                <div className="success-icon">
                  <HiOutlineCheck size={48} />
                </div>
                <h2>¡Gracias!</h2>
                <p>Tu respuesta ha sido registrada correctamente.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSubmitted(false)
                    setAnswers({})
                  }}
                >
                  Enviar otra respuesta
                </button>
              </div>
            ) : (
              <>
                {/* Form Header */}
                <div className="form-header">
                  <h2>{form.title}</h2>
                  {form.description && <p>{form.description}</p>}
                </div>

                {/* Questions */}
                <div className="questions-list">
                  {currentQuestions.map((question, idx) => (
                    <div key={idx} className="question-item">
                      <label className="question-label">
                        {question.label}
                        {question.required && <span className="required">*</span>}
                      </label>
                      {question.hint && (
                        <p className="question-hint">{question.hint}</p>
                      )}
                      <div className="question-input">
                        {renderQuestion(question)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="form-navigation">
                  {pages.length > 1 && currentPage > 0 && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Anterior
                    </button>
                  )}
                  
                  {currentPage < pages.length - 1 ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={handleSubmit}
                    >
                      Enviar
                    </button>
                  )}
                </div>

                {/* Page indicator */}
                {pages.length > 1 && (
                  <div className="page-indicator">
                    {pages.map((_, i) => (
                      <span
                        key={i}
                        className={`dot ${i === currentPage ? 'active' : ''}`}
                      ></span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FormPreview
