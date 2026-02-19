import { useState } from 'react'
import { 
  HiOutlineChartBar, 
  HiOutlineUsers, 
  HiOutlineDocumentText, 
  HiOutlineChartPie, 
  HiOutlineCog 
} from 'react-icons/hi'
import './Login.css'

function Login({ onLogin }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulación de login
    setTimeout(() => {
      if (credentials.email && credentials.password) {
        onLogin()
      } else {
        setError('Por favor complete todos los campos')
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <span>A</span>
            </div>
            <h1>Admin Panel</h1>
            <p>Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="admin@ejemplo.com"
                value={credentials.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
              <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg login-btn"
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="login-footer">
            <p>Panel administrativo de <strong>Mobile App</strong></p>
          </div>
        </div>

        <div className="login-info">
          <h2>Bienvenido al Panel de Control</h2>
          <p>Gestiona usuarios, formularios y configuraciones de la aplicación móvil desde un solo lugar.</p>
          <ul className="login-features">
            <li><HiOutlineChartBar size={20} /> Dashboard con métricas en tiempo real</li>
            <li><HiOutlineUsers size={20} /> Gestión completa de usuarios</li>
            <li><HiOutlineDocumentText size={20} /> Administración de formularios</li>
            <li><HiOutlineChartPie size={20} /> Analíticas detalladas</li>
            <li><HiOutlineCog size={20} /> Configuración centralizada</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Login
