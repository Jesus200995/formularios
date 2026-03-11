import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

const API_URL = 'https://apidata.geodatos.com.mx/api'

const TERRITORIOS = [
  "Acapulco - Centro - Norte - Tierra Caliente",
  "Acayucan",
  "Balancán",
  "Chihuahua / Sonora",
  "Colima",
  "Comalcalco",
  "Córdoba",
  "Costa Chica - Montaña",
  "Costa Grande - Sierra",
  "Durango / Zacatecas",
  "Hidalgo",
  "Istmo",
  "Michoacán",
  "Mixteca",
  "Morelos",
  "Nayarit / Jalisco",
  "Ocosingo",
  "Palenque",
  "Papantla",
  "Pichucalco",
  "Puebla",
  "San Luis Potosí",
  "Sinaloa",
  "Tamaulipas",
  "Tantoyuca",
  "Tapachula",
  "Teapa",
  "Tlaxcala / Estado de México",
  "Tzucacab / Opb",
  "Xpujil",
  "Oficinas Centrales"
]

const PUESTOS = [
  "TECNICO PRODUCTIVO",
  "TECNICO SOCIAL",
  "FACILITADOR COMUNITARIO",
  "COORDINACION TERRITORIAL",
  "ESPECIALISTAS PRODUCTIVOS Y SOCIALES"
]

function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    curp: '',
    territorio: '',
    puesto_trabajo: '',
    supervisor: '',
    telefono: '',
    password: '',
    password_confirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [validations, setValidations] = useState({
    curp: { valid: false, message: '' },
    email: { valid: false, message: '' },
    password: { valid: false, message: '' },
    passwordMatch: { valid: false, message: '' }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    let processedValue = value

    // CURP siempre en mayúsculas y máximo 18 caracteres
    if (name === 'curp') {
      processedValue = value.toUpperCase().slice(0, 18)
    }

    // Teléfono solo números
    if (name === 'telefono') {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 10)
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }))
    setError('')

    // Validaciones en tiempo real
    validateField(name, processedValue)
  }

  const validateField = (name, value) => {
    const newValidations = { ...validations }

    switch (name) {
      case 'curp':
        if (value.length === 18) {
          const curpRegex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$/
          newValidations.curp = {
            valid: curpRegex.test(value),
            message: curpRegex.test(value) ? '' : 'Formato de CURP inválido'
          }
        } else {
          newValidations.curp = {
            valid: false,
            message: value.length > 0 ? `${value.length}/18 caracteres` : ''
          }
        }
        break
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        newValidations.email = {
          valid: emailRegex.test(value),
          message: value && !emailRegex.test(value) ? 'Correo inválido' : ''
        }
        break
      case 'password':
        newValidations.password = {
          valid: value.length >= 6,
          message: value && value.length < 6 ? 'Mínimo 6 caracteres' : ''
        }
        // También verificar coincidencia
        if (formData.password_confirm) {
          newValidations.passwordMatch = {
            valid: value === formData.password_confirm,
            message: value !== formData.password_confirm ? 'Las contraseñas no coinciden' : ''
          }
        }
        break
      case 'password_confirm':
        newValidations.passwordMatch = {
          valid: value === formData.password,
          message: value !== formData.password ? 'Las contraseñas no coinciden' : ''
        }
        break
    }

    setValidations(newValidations)
  }

  const isStep1Valid = () => {
    return formData.nombre.trim().length >= 2 &&
           formData.apellidos.trim().length >= 2 &&
           validations.email.valid &&
           validations.curp.valid
  }

  const isStep2Valid = () => {
    return formData.territorio !== '' &&
           formData.puesto_trabajo !== '' &&
           formData.telefono.length === 10
  }

  const isStep3Valid = () => {
    return validations.password.valid && validations.passwordMatch.valid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isStep3Valid()) {
      setError('Por favor verifica que las contraseñas coincidan')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/app-auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(data.detail || 'Error al registrar usuario')
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && isStep1Valid()) setStep(2)
    else if (step === 2 && isStep2Valid()) setStep(3)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card success-card">
          <div className="success-animation">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>¡Registro Exitoso!</h2>
          <p>Tu cuenta ha sido creada correctamente.</p>
          <p className="redirect-text">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <Link to="/login" className="back-button">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">Paso {step} de 3</p>
          
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        {error && (
          <div className="auth-error">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Step 1: Personal Info */}
          <div className={`form-step ${step === 1 ? 'active' : ''}`}>
            <h3 className="step-title">Información Personal</h3>
            
            <div className="form-group">
              <label htmlFor="nombre">Nombre(s) *</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Juan Carlos"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="apellidos">Apellidos *</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Ej: García López"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico *</label>
              <div className={`input-wrapper ${validations.email.message ? 'error' : validations.email.valid ? 'valid' : ''}`}>
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  required
                />
                {validations.email.valid && (
                  <svg className="validation-icon valid" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {validations.email.message && <span className="field-error">{validations.email.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="curp">CURP *</label>
              <div className={`input-wrapper ${validations.curp.message && !validations.curp.valid ? 'error' : validations.curp.valid ? 'valid' : ''}`}>
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 8H17M7 12H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  id="curp"
                  name="curp"
                  value={formData.curp}
                  onChange={handleChange}
                  placeholder="XXXX000000XXXXXX00"
                  maxLength={18}
                  required
                />
                {validations.curp.valid && (
                  <svg className="validation-icon valid" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {validations.curp.message && (
                <span className={`field-info ${validations.curp.valid ? '' : 'counting'}`}>
                  {validations.curp.message}
                </span>
              )}
            </div>
          </div>

          {/* Step 2: Work Info */}
          <div className={`form-step ${step === 2 ? 'active' : ''}`}>
            <h3 className="step-title">Información Laboral</h3>
            
            <div className="form-group">
              <label htmlFor="territorio">Territorio *</label>
              <div className="input-wrapper select-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <select
                  id="territorio"
                  name="territorio"
                  value={formData.territorio}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona tu territorio</option>
                  {TERRITORIOS.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="puesto_trabajo">Puesto de Trabajo *</label>
              <div className="input-wrapper select-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <select
                  id="puesto_trabajo"
                  name="puesto_trabajo"
                  value={formData.puesto_trabajo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona tu puesto</option>
                  {PUESTOS.map((p, i) => (
                    <option key={i} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="supervisor">Supervisor (Opcional)</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 16.79 15.21 15 13 15H5C2.79 15 1 16.79 1 19V21" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M23 21V19C22.99 17.65 22.13 16.47 20.87 16.08" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M16.87 4.08C18.14 4.46 19 5.65 19 7C19 8.35 18.14 9.54 16.87 9.92" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  id="supervisor"
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleChange}
                  placeholder="Nombre del supervisor"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono *</label>
              <div className={`input-wrapper ${formData.telefono.length === 10 ? 'valid' : ''}`}>
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92V19.92C22 20.97 21.16 21.85 20.11 21.99C19.76 22.03 19.41 22.05 19.05 22.05C10.51 22.05 3.64 15.37 3.01 6.93C2.97 6.57 2.95 6.22 2.95 5.86C2.99 4.81 3.87 3.97 4.92 3.97H7.92C8.47 3.97 8.96 4.32 9.13 4.85C9.38 5.64 9.71 6.4 10.12 7.12C10.33 7.49 10.26 7.96 9.95 8.26L8.59 9.62C9.76 11.85 11.57 13.66 13.8 14.83L15.16 13.47C15.46 13.16 15.93 13.09 16.3 13.3C17.02 13.71 17.78 14.04 18.57 14.29C19.1 14.46 19.45 14.95 19.45 15.5V18.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="10 dígitos"
                  maxLength={10}
                  required
                />
                {formData.telefono.length === 10 && (
                  <svg className="validation-icon valid" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="field-info counting">{formData.telefono.length}/10 dígitos</span>
            </div>
          </div>

          {/* Step 3: Password */}
          <div className={`form-step ${step === 3 ? 'active' : ''}`}>
            <h3 className="step-title">Crear Contraseña</h3>
            
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <div className={`input-wrapper ${validations.password.message ? 'error' : validations.password.valid ? 'valid' : ''}`}>
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20C7 20 2.73 16.39 1 12C1.69 9.24 3.16 6.83 5.25 5.05M9.9 4.24A9.12 9.12 0 0112 4C17 4 21.27 7.61 23 12C22.18 14.12 20.79 15.98 19 17.41M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
              {validations.password.message && <span className="field-error">{validations.password.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password_confirm">Confirmar Contraseña *</label>
              <div className={`input-wrapper ${validations.passwordMatch.message ? 'error' : validations.passwordMatch.valid ? 'valid' : ''}`}>
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  id="password_confirm"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                >
                  {showPasswordConfirm ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20C7 20 2.73 16.39 1 12C1.69 9.24 3.16 6.83 5.25 5.05M9.9 4.24A9.12 9.12 0 0112 4C17 4 21.27 7.61 23 12C22.18 14.12 20.79 15.98 19 17.41M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
                {validations.passwordMatch.valid && (
                  <svg className="validation-icon valid" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {validations.passwordMatch.message && <span className="field-error">{validations.passwordMatch.message}</span>}
            </div>

            <div className="password-requirements">
              <p>La contraseña debe tener:</p>
              <ul>
                <li className={formData.password.length >= 6 ? 'met' : ''}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Mínimo 6 caracteres
                </li>
                <li className={formData.password === formData.password_confirm && formData.password_confirm ? 'met' : ''}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Las contraseñas coinciden
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="form-navigation">
            {step > 1 && (
              <button type="button" className="nav-button prev" onClick={prevStep}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Anterior
              </button>
            )}
            
            {step < 3 ? (
              <button 
                type="button" 
                className="nav-button next"
                onClick={nextStep}
                disabled={step === 1 ? !isStep1Valid() : !isStep2Valid()}
              >
                Siguiente
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : (
              <button 
                type="submit" 
                className={`auth-button ${loading ? 'loading' : ''}`}
                disabled={loading || !isStep3Valid()}
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <span>Crear Cuenta</span>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        <div className="auth-footer">
          <p>¿Ya tienes cuenta?</p>
          <Link to="/login" className="auth-link">
            Inicia sesión
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
