import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
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
import './PublicForm.css'

const API_URL = 'https://apidata.geodatos.com.mx/api'

function PublicForm() {
  const { formId } = useParams()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchForm()
  }, [formId])

  const fetchForm = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/forms/public/${formId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Formulario no encontrado')
        } else if (response.status === 403) {
          const data = await response.json()
          throw new Error(data.detail || 'Formulario no disponible')
        } else {
          throw new Error('Error al cargar el formulario')
        }
      }
      
      const data = await response.json()
      setForm(data)
    } catch (err) {
      console.error('Error fetching form:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleSubmit = async () => {
    if (!form) return

    // Validate required questions
    const requiredQuestions = form.questions.filter(q => q.required)
    const missingRequired = requiredQuestions.filter(q => !answers[q.id] || answers[q.id] === '')
    
    if (missingRequired.length > 0) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    try {
      setSubmitting(true)

      // Format answers for submission
      const formattedAnswers = Object.entries(answers)
        .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        .map(([questionId, value]) => {
          const answer = {
            question_id: parseInt(questionId),
            repeat_index: 0
          }

          // Determine the appropriate value field based on type
          if (typeof value === 'number') {
            answer.value_number = value
          } else if (Array.isArray(value)) {
            answer.value_json = value
          } else if (typeof value === 'object' && value !== null) {
            answer.value_json = value
          } else {
            answer.value_text = String(value)
          }

          return answer
        })

      const response = await fetch(`${API_URL}/submissions/forms/${formId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers: formattedAnswers,
          status: 'completed'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Error al enviar el formulario')
      }

      setSubmitted(true)
      setAnswers({})
      setCurrentPage(0)
    } catch (err) {
      console.error('Error submitting form:', err)
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const renderQuestion = (question) => {
    const value = answers[question.id] || ''

    switch (question.question_type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={question.placeholder || 'Escribe tu respuesta...'}
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            required={question.required}
          />
        )
      
      case 'textarea':
        return (
          <textarea
            placeholder={question.placeholder || 'Escribe tu respuesta...'}
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            rows={4}
            required={question.required}
          />
        )
      
      case 'number':
      case 'integer':
      case 'decimal':
        return (
          <input
            type="number"
            placeholder="0"
            step={question.question_type === 'integer' ? '1' : 'any'}
            value={value}
            onChange={(e) => handleAnswer(question.id, parseFloat(e.target.value) || '')}
            required={question.required}
          />
        )
      
      case 'range':
        const rangeMin = (question.validation && question.validation.min) || 0
        const rangeMax = (question.validation && question.validation.max) || 100
        const rangeStep = question.step || 1
        return (
          <div className="range-input">
            <input
              type="range"
              min={rangeMin}
              max={rangeMax}
              step={rangeStep}
              value={value || rangeMin}
              onChange={(e) => handleAnswer(question.id, parseFloat(e.target.value))}
            />
            <span className="range-value">{value || rangeMin}</span>
          </div>
        )
      
      case 'email':
        return (
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            required={question.required}
          />
        )
      
      case 'phone':
        return (
          <input
            type="tel"
            placeholder="+52 123 456 7890"
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            required={question.required}
          />
        )
      
      case 'url':
        return (
          <input
            type="url"
            placeholder="https://ejemplo.com"
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            required={question.required}
          />
        )
      
      case 'select':
      case 'select_one':
        return (
          <select
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            required={question.required}
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
                  name={`q-${question.id}`}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  required={question.required}
                />
                <span className="radio-custom"></span>
                {opt.label}
              </label>
            ))}
          </div>
        )
      
      case 'checkbox':
      case 'select_multiple':
        return (
          <div className="checkbox-group">
            {(question.options || []).map((opt, i) => (
              <label key={i} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={(Array.isArray(value) ? value : []).includes(opt.value)}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? value : []
                    if (e.target.checked) {
                      handleAnswer(question.id, [...current, opt.value])
                    } else {
                      handleAnswer(question.id, current.filter(v => v !== opt.value))
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
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              required={question.required}
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
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              required={question.required}
            />
          </div>
        )
      
      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            required={question.required}
          />
        )
      
      case 'rating':
        const maxRating = (question.validation && question.validation.max) || 5
        return (
          <div className="rating-input">
            {[...Array(maxRating)].map((_, i) => (
              <button
                key={i}
                type="button"
                className={`star ${value > i ? 'active' : ''}`}
                onClick={() => handleAnswer(question.id, i + 1)}
              >
                <HiOutlineStar size={28} />
              </button>
            ))}
          </div>
        )
      
      case 'scale':
        const scaleMin = (question.validation && question.validation.min) || 1
        const scaleMax = (question.validation && question.validation.max) || 10
        return (
          <div className="scale-input">
            <span>{scaleMin}</span>
            <div className="scale-options">
              {[...Array(scaleMax - scaleMin + 1)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`scale-option ${value === scaleMin + i ? 'active' : ''}`}
                  onClick={() => handleAnswer(question.id, scaleMin + i)}
                >
                  {scaleMin + i}
                </button>
              ))}
            </div>
            <span>{scaleMax}</span>
          </div>
        )
      
      case 'note':
        return (
          <div className="note-display">
            <p>{question.description}</p>
          </div>
        )
      
      case 'image':
      case 'file':
        return (
          <div className="file-input">
            <HiOutlinePhotograph size={32} />
            <input
              type="file"
              accept={question.question_type === 'image' ? 'image/*' : '*/*'}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleAnswer(question.id, file.name)
                }
              }}
            />
          </div>
        )
      
      case 'geopoint':
        return (
          <div className="gps-input">
            <HiOutlineLocationMarker size={32} />
            <p>Capturar ubicación GPS</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                      }
                      handleAnswer(question.id, location)
                      alert(`Ubicación capturada: ${location.latitude}, ${location.longitude}`)
                    },
                    (error) => {
                      alert('Error al obtener ubicación: ' + error.message)
                    }
                  )
                } else {
                  alert('Geolocalización no disponible en este navegador')
                }
              }}
            >
              {value ? `Lat: ${value.latitude?.toFixed(6)}, Lon: ${value.longitude?.toFixed(6)}` : 'Capturar GPS'}
            </button>
          </div>
        )
      
      case 'barcode':
        return (
          <div className="barcode-input">
            <input
              type="text"
              placeholder="Escanea o ingresa el código"
              value={value}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              required={question.required}
            />
          </div>
        )
      
      case 'hidden':
        return null
      
      default:
        return (
          <input
            type="text"
            placeholder="Respuesta..."
            value={value}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            required={question.required}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="public-form loading">
        <div className="loading-spinner"></div>
        <p>Cargando formulario...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="public-form error">
        <div className="error-icon">
          <HiOutlineExclamation size={48} />
        </div>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (!form) {
    return null
  }

  const questions = form.questions || []
  
  // Group questions by page if needed
  const pages = [[...questions]]
  const currentQuestions = pages[currentPage] || []

  return (
    <div className="public-form">
      <div className="form-container">
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
              <h1>{form.title}</h1>
              {form.description && <p className="form-description">{form.description}</p>}
            </div>

            {/* Questions */}
            <div className="questions-list">
              {currentQuestions.map((question) => (
                <div key={question.id} className="question-item">
                  <label className="question-label">
                    {question.label}
                    {question.required && <span className="required">*</span>}
                  </label>
                  {question.description && (
                    <p className="question-description">{question.description}</p>
                  )}
                  <div className="question-input">
                    {renderQuestion(question)}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PublicForm
