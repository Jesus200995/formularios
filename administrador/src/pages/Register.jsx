import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  HiOutlineUserAdd,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineUserGroup
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
    role: 'user',
    password: '',
    password_confirm: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.curp || !formData.role || !formData.password || !formData.password_confirm) {
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
          role: formData.role,
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
        <div className="register-wrapper">
          <div className="success-container">
            <div className="success-icon">
              <HiOutlineCheckCircle size={64} />
            </div>
            <h2>¡Registro Exitoso!</h2>
            <p>Tu cuenta ha sido creada correctamente.</p>
            <p className="redirect-text">Redirigiendo al inicio de sesión...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-logo">
              <span>R</span>
            </div>
            <h1>Crear Cuenta</h1>
            <p>Completa tus datos para registrarte</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {error && (
              <div className="register-error">
                {error}
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">Nombre</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  className="form-control"
                  placeholder="Ej: Juan"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Apellidos</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  className="form-control"
                  placeholder="Ej: Pérez García"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="usuario@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="curp">CURP</label>
              <input
                type="text"
                id="curp"
                name="curp"
                className="form-control"
                placeholder="18 caracteres"
                value={formData.curp}
                onChange={(e) => handleChange({ target: { name: 'curp', value: e.target.value.toUpperCase() } })}
                maxLength={18}
                required
              />
              <small className="form-text">18 caracteres en mayúsculas</small>
            </div>

            <div className="form-group">
              <label htmlFor="role">Rol</label>
              <select
                id="role"
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
                <small className="form-text">Mínimo 6 caracteres</small>
              </div>

              <div className="form-group">
                <label htmlFor="password_confirm">Confirmar contraseña</label>
                <input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg register-btn"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="register-footer">
            <p>¿Ya tienes cuenta? <button onClick={() => navigate('/login')} className="link-btn">Inicia sesión</button></p>
          </div>
        </div>

        <div className="register-info">
          <h2>Únete a nuestra plataforma</h2>
          <p>Crea tu cuenta y comienza a gestionar formularios de manera eficiente.</p>
          <ul className="register-features">
            <li><HiOutlineUserGroup size={20} /> Gestión completa de usuarios</li>
            <li><HiOutlineCheckCircle size={20} /> Registro rápido y seguro</li>
            <li><HiOutlineClock size={20} /> Acceso inmediato</li>
            <li><HiOutlineShieldCheck size={20} /> Datos protegidos</li>
            <li><HiOutlineUserAdd size={20} /> Proceso simple</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Register
