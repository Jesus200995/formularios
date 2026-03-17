import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './FormularioDetalle.css'

function FormularioDetalle() {
  const { publicCode } = useParams()
  const navigate = useNavigate()
  
  const [formulario, setFormulario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [mode, setMode] = useState('card') // 'card' or 'list'

  useEffect(() => {
    fetchFormulario()
  }, [publicCode])

  const fetchFormulario = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`https://apidata.geodatos.com.mx/api/forms/public/${publicCode}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al cargar el formulario')
      }
      
      const data = await response.json()
      setFormulario(data)
      
      // Initialize answers with default values
      const initialAnswers = {}
      data.questions.forEach(q => {
        if (q.default_value) {
          initialAnswers[q.id] = q.default_value
        }
      })
      setAnswers(initialAnswers)
    } catch (err) {
      console.error('Error fetching form:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, value, questionType) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const validateForm = () => {
    if (!formulario) return false
    
    const errors = []
    formulario.questions.forEach(question => {
      if (question.required && !answers[question.id]) {
        errors.push(question.label)
      }
      
      // Validation rules
      if (answers[question.id] && question.validation) {
        const val = question.validation
        const answer = answers[question.id]
        
        if (val.min_length && answer.length < val.min_length) {
          errors.push(`${question.label}: mínimo ${val.min_length} caracteres`)
        }
        if (val.max_length && answer.length > val.max_length) {
          errors.push(`${question.label}: máximo ${val.max_length} caracteres`)
        }
        if (val.pattern && !new RegExp(val.pattern).test(answer)) {
          errors.push(val.message || `${question.label}: formato inválido`)
        }
      }
    })
    
    if (errors.length > 0) {
      alert('Por favor completa los siguientes campos:\n\n' + errors.join('\n'))
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setSubmitting(true)
      
      // Convert answers to backend format
      const formattedAnswers = Object.entries(answers).map(([questionId, value]) => {
        const question = formulario.questions.find(q => q.id === parseInt(questionId))
        const answer = {
          question_id: parseInt(questionId),
          repeat_index: 0
        }
        
        // Set value based on question type
        if (['integer', 'decimal', 'range', 'rating'].includes(question.question_type)) {
          answer.value_number = parseFloat(value)
        } else if (['select_multiple', 'matrix', 'geopoint', 'ranking'].includes(question.question_type)) {
          answer.value_json = typeof value === 'string' ? JSON.parse(value) : value
        } else if (['image', 'audio', 'video', 'file'].includes(question.question_type)) {
          answer.value_file = value
        } else {
          answer.value_text = value
        }
        
        return answer
      })
      
      const submissionData = {
        status: 'completed',
        answers: formattedAnswers,
        geolocation: null
      }
      
      // Obtener token del usuario autenticado
      const token = localStorage.getItem('app_token')
      
      const response = await fetch(`https://apidata.geodatos.com.mx/api/submissions/forms/${formulario.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(submissionData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Error al enviar el formulario')
      }
      
      // Success!
      alert('¡Formulario enviado exitosamente! ✅')
      navigate('/formularios')
    } catch (err) {
      console.error('Error submitting form:', err)
      alert('Error al enviar: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question, index) => {
    const value = answers[question.id] || ''
    
    switch (question.question_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <input
            type={question.question_type === 'email' ? 'email' : question.question_type === 'phone' ? 'tel' : question.question_type === 'url' ? 'url' : 'text'}
            className="form-input"
            placeholder={question.placeholder || 'Escribe tu respuesta...'}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.question_type)}
            required={question.required}
          />
        )
      
      case 'textarea':
        return (
          <textarea
            className="form-textarea"
            placeholder={question.placeholder || 'Escribe tu respuesta...'}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.question_type)}
            required={question.required}
            rows="4"
          />
        )
      
      case 'integer':
      case 'decimal':
        return (
          <input
            type="number"
            className="form-input"
            placeholder={question.placeholder || '0'}
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.question_type)}
            required={question.required}
            min={question.min_value}
            max={question.max_value}
            step={question.question_type === 'integer' ? '1' : question.step || '0.01'}
          />
        )
      
      case 'range':
        return (
          <div className="range-container">
            <input
              type="range"
              className="form-range"
              value={value || question.min_value || 0}
              onChange={(e) => handleAnswerChange(question.id, e.target.value, question.question_type)}
              required={question.required}
              min={question.min_value || 0}
              max={question.max_value || 100}
              step={question.step || 1}
            />
            <div className="range-value">{value || question.min_value || 0}</div>
          </div>
        )
      
      case 'select_one':
        return (
          <div className="options-container">
            {question.options.map((option, idx) => (
              <label key={idx} className="option-label">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value, question.question_type)}
                  required={question.required}
                />
                <span className="option-text">{option.label}</span>
                {option.image && <img src={option.image} alt={option.label} className="option-image" />}
              </label>
            ))}
          </div>
        )
      
      case 'select_multiple':
        return (
          <div className="options-container">
            {question.options.map((option, idx) => {
              const selectedValues = value ? (Array.isArray(value) ? value : JSON.parse(value || '[]')) : []
              const isChecked = selectedValues.includes(option.value)
              
              return (
                <label key={idx} className="option-label">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={isChecked}
                    onChange={(e) => {
                      const newValues = isChecked
                        ? selectedValues.filter(v => v !== option.value)
                        : [...selectedValues, option.value]
                      handleAnswerChange(question.id, JSON.stringify(newValues), question.question_type)
                    }}
                  />
                  <span className="option-text">{option.label}</span>
                  {option.image && <img src={option.image} alt={option.label} className="option-image" />}
                </label>
              )
            })}
          </div>
        )
      
      case 'date':
        return (
          <input
            type="date"
            className="form-input"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.question_type)}
            required={question.required}
          />
        )
      
      case 'time':
        return (
          <input
            type="time"
            className="form-input"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.question_type)}
            required={question.required}
          />
        )
      
      case 'datetime':
        return (
          <input
            type="datetime-local"
            className="form-input"
            value={value}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.question_type)}
            required={question.required}
          />
        )
      
      case 'rating':
        const maxRating = question.max_value || 5
        return (
          <div className="rating-container">
            {[...Array(maxRating)].map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`rating-star ${value > idx ? 'active' : ''}`}
                onClick={() => handleAnswerChange(question.id, idx + 1, question.question_type)}
              >
                ⭐
              </button>
            ))}
          </div>
        )
      
      case 'note':
        return (
          <div className="note-content" dangerouslySetInnerHTML={{ __html: question.description || question.label }} />
        )
      
      default:
        return (
          <div className="unsupported-type">
            <p>Tipo de pregunta no soportado: {question.question_type}</p>
            <textarea
              className="form-textarea"
              placeholder="Respuesta manual..."
              value={value}
              onChange={(e) => handleAnswerChange(question.id, e.target.value, question.question_type)}
              rows="2"
            />
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="formulario-container loading">
        <div className="spinner"></div>
        <p>Cargando formulario...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="formulario-container error">
        <div className="error-icon">⚠️</div>
        <h2>Error</h2>
        <p>{error}</p>
        <button className="retry-button" onClick={fetchFormulario}>Reintentar</button>
        <button className="back-button" onClick={() => navigate('/formularios')}>Volver</button>
      </div>
    )
  }

  if (!formulario) {
    return (
      <div className="formulario-container error">
        <div className="error-icon">❓</div>
        <h2>Formulario no encontrado</h2>
        <button className="back-button" onClick={() => navigate('/formularios')}>Volver</button>
      </div>
    )
  }

  // Card mode - one question at a time
  if (mode === 'card' && formulario.questions.length > 0) {
    const question = formulario.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / formulario.questions.length) * 100
    
    return (
      <div className="formulario-container card-mode">
        {/* Header */}
        <div className="form-header">
          <button className="back-btn" onClick={() => navigate('/formularios')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="header-info">
            <h1>{formulario.title}</h1>
            <p>{formulario.description}</p>
          </div>
          <button className="mode-toggle" onClick={() => setMode('list')}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="4" width="18" height="4" rx="1"/>
              <rect x="3" y="10" width="18" height="4" rx="1"/>
              <rect x="3" y="16" width="18" height="4" rx="1"/>
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-text">
          Pregunta {currentQuestion + 1} de {formulario.questions.length}
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-number">#{currentQuestion + 1}</div>
          <h2 className="question-label">
            {question.label}
            {question.required && <span className="required">*</span>}
          </h2>
          {question.description && <p className="question-description">{question.description}</p>}
          
          <div className="question-answer">
            {renderQuestion(question, currentQuestion)}
          </div>
        </div>

        {/* Navigation */}
        <div className="card-navigation">
          <button
            className="nav-btn prev"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Anterior
          </button>
          
          {currentQuestion === formulario.questions.length - 1 ? (
            <button className="nav-btn submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </button>
          ) : (
            <button
              className="nav-btn next"
              onClick={() => setCurrentQuestion(prev => Math.min(formulario.questions.length - 1, prev + 1))}
            >
              Siguiente
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    )
  }

  // List mode - all questions at once
  return (
    <div className="formulario-container list-mode">
      {/* Header */}
      <div className="form-header">
        <button className="back-btn" onClick={() => navigate('/formularios')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="header-info">
          <h1>{formulario.title}</h1>
          <p>{formulario.description}</p>
        </div>
        {formulario.questions.length > 3 && (
          <button className="mode-toggle" onClick={() => setMode('card')}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2"/>
            </svg>
          </button>
        )}
      </div>

      {/* Form */}
      <form className="form-content" onSubmit={handleSubmit}>
        {formulario.questions.map((question, index) => (
          <div key={question.id} className="question-item">
            <div className="question-number">#{index + 1}</div>
            <h3 className="question-label">
              {question.label}
              {question.required && <span className="required">*</span>}
            </h3>
            {question.description && <p className="question-description">{question.description}</p>}
            
            <div className="question-answer">
              {renderQuestion(question, index)}
            </div>
          </div>
        ))}

        <button type="submit" className="submit-button" disabled={submitting}>
          {submitting ? (
            <>
              <div className="button-spinner"></div>
              Enviando...
            </>
          ) : (
            <>
              Enviar Formulario
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default FormularioDetalle
