import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  HiOutlineMail, 
  HiOutlineUser, 
  HiOutlineLockClosed,
  HiOutlineIdentification,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle
} from 'react-icons/hi'
import './Register.css'

const API_URL = import.meta.env.VITE_API_URL || 'https://apidata.geodatos.com.mx/api'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    curp: '',
    password: '',
    password_confirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    setError('')
  }

  const validateCURP = (curp) => {
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/
    return curpRegex.test(curp.toUpperCase())
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validaciones
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.curp || !formData.password || !formData.password_confirm) {
      setError('Todos los campos son obligatorios')
      return
    }

    if (!validateEmail(formData.email)) {
      setError('El correo electrónico no es válido')
      return
    }

    if (!validateCURP(formData.curp)) {
      setError('El CURP no es válido. Debe tener 18 caracteres')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (formData.password !== formData.password_confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          curp: formData.curp.toUpperCase(),
          password: formData.password,
          password_confirm: formData.password_confirm
        })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.detail || 'Error al registrar usuario')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de conexión. Intente nuevamente')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="register-page">
        <div className="register-container success-animation">
          <div className="success-icon">
            <HiOutlineCheckCircle size={64} />
          </div>
          <h2>¡Registro Exitoso!</h2>
          <p>Tu cuenta ha sido creada correctamente.</p>
          <p className="redirect-text">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="register-page">
      <div className="register-container fade-in">
        <div className="register-header">
          <div className="logo-circle">
            <HiOutlineUser size={32} />
          </div>
          <h1>Crear cuenta</h1>
          <p>Completa tus datos para registrarte</p>
        </div>

        {error && (
          <div className="error-message slide-down">
            <HiOutlineExclamationCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className={`input-group ${focusedField === 'first_name' ? 'focused' : ''} ${formData.first_name ? 'has-value' : ''}`}>
              <label htmlFor="first_name">Nombre</label>
              <div className="input-wrapper">
                <HiOutlineUser className="input-icon" size={20} />
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('first_name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder=" "
                  required
                />
              </div>
            </div>

            <div className={`input-group ${focusedField === 'last_name' ? 'focused' : ''} ${formData.last_name ? 'has-value' : ''}`}>
              <label htmlFor="last_name">Apellidos</label>
              <div className="input-wrapper">
                <HiOutlineUser className="input-icon" size={20} />
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('last_name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder=" "
                  required
                />
              </div>
            </div>
          </div>

          <div className={`input-group ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'has-value' : ''}`}>
            <label htmlFor="email">Correo electrónico</label>
            <div className="input-wrapper">
              <HiOutlineMail className="input-icon" size={20} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder=" "
                required
              />
            </div>
          </div>

          <div className={`input-group ${focusedField === 'curp' ? 'focused' : ''} ${formData.curp ? 'has-value' : ''}`}>
            <label htmlFor="curp">CURP</label>
            <div className="input-wrapper">
              <HiOutlineIdentification className="input-icon" size={20} />
              <input
                type="text"
                id="curp"
                name="curp"
                value={formData.curp}
                onChange={(e) => handleChange({ target: { name: 'curp', value: e.target.value.toUpperCase() } })}
                onFocus={() => setFocusedField('curp')}
                onBlur={() => setFocusedField(null)}
                placeholder=" "
                maxLength={18}
                required
              />
            </div>
            <span className="input-hint">18 caracteres</span>
          </div>

          <div className={`input-group ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'has-value' : ''}`}>
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <HiOutlineLockClosed className="input-icon" size={20} />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder=" "
                minLength={6}
                required
              />
            </div>
            <span className="input-hint">Mínimo 6 caracteres</span>
          </div>

          <div className={`input-group ${focusedField === 'password_confirm' ? 'focused' : ''} ${formData.password_confirm ? 'has-value' : ''}`}>
            <label htmlFor="password_confirm">Confirmar contraseña</label>
            <div className="input-wrapper">
              <HiOutlineLockClosed className="input-icon" size={20} />
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                onFocus={() => setFocusedField('password_confirm')}
                onBlur={() => setFocusedField(null)}
                placeholder=" "
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <span>Crear cuenta</span>
                <HiOutlineArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>¿Ya tienes cuenta? <button onClick={() => navigate('/login')} className="link-btn">Inicia sesión</button></p>
        </div>
      </div>
    </div>
  )
}

export default Register
