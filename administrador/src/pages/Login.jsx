import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  HiOutlineChartBar, 
  HiOutlineUsers, 
  HiOutlineDocumentText, 
  HiOutlineChartPie, 
  HiOutlineCog 
} from 'react-icons/hi'
import './Login.css'

// Siempre usar la URL del API remoto
const API_URL = 'https://apidata.geodatos.com.mx/api'

function Login({ onLogin }) {
  const navigate = useNavigate()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validaciones básicas
    if (!credentials.email || !credentials.password) {
      setError('Por favor complete todos los campos')
      setLoading(false)
      return
    }
    
    try {
      console.log('Intentando login en:', `${API_URL}/auth/login`)
      
      // Usar FormData para enviar las credenciales (OAuth2PasswordRequestForm)
      const formData = new URLSearchParams()
      formData.append('username', credentials.email)
      formData.append('password', credentials.password)

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      })

      console.log('Login response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Login exitoso, obteniendo datos del usuario...')
        
        // Guardar token en localStorage
        localStorage.setItem('token', data.access_token)
        
        // Obtener información del usuario
        const userResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          console.log('Usuario autenticado:', userData.email)
          localStorage.setItem('user', JSON.stringify(userData))
          onLogin()
        } else {
          // Si no se pueden obtener los datos del usuario, limpiar y mostrar error
          localStorage.removeItem('token')
          setError('Error al obtener datos del usuario')
        }
      } else {
        const errorData = await response.json()
        console.log('Error de login:', errorData)
        
        // Mostrar mensaje de error específico
        if (response.status === 401) {
          setError('Email o contraseña incorrectos')
        } else if (response.status === 403) {
          setError('Su cuenta está desactivada')
        } else {
          setError(errorData.detail || 'Error al iniciar sesión')
        }
      }
    } catch (err) {
      console.error('Error de conexión:', err)
      setError('Error de conexión con el servidor. Verifique su conexión a internet.')
    } finally {
      setLoading(false)
    }
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
            <p>¿No tienes cuenta? <button onClick={() => navigate('/register')} className="link-btn" style={{ background: 'none', border: 'none', color: '#667eea', fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: '14px' }}>Regístrate aquí</button></p>
            <p style={{ marginTop: '8px', color: '#999' }}>Panel administrativo de <strong>Mobile App</strong></p>
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
