import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Services from './pages/Services'
import FormularioDetalle from './pages/FormularioDetalle'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

// Update Modal Component
function UpdateModal({ onUpdate, onDismiss }) {
  const [installing, setInstalling] = useState(false)

  const handleUpdate = async () => {
    setInstalling(true)
    await onUpdate()
    setTimeout(() => window.location.reload(), 500)
  }

  return (
    <div className="update-modal-overlay">
      <div className="update-modal">
        <div className="update-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <h3 className="update-modal-title">Nueva actualización disponible</h3>
        <p className="update-modal-text">Hay una nueva versión de la aplicación lista para instalar.</p>
        <div className="update-modal-buttons">
          <button className="update-btn-dismiss" onClick={onDismiss} disabled={installing}>Más tarde</button>
          <button className="update-btn-install" onClick={handleUpdate} disabled={installing}>
            {installing ? (
              <><span className="update-spinner"></span>Instalando...</>
            ) : (
              'Actualizar ahora'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUpdate, setShowUpdate] = useState(false)
  const [updateCallback, setUpdateCallback] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('app_user')
    const token = localStorage.getItem('app_token')
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('app_user')
        localStorage.removeItem('app_token')
      }
    }
    setLoading(false)
  }, [])

  // Prevent scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [menuOpen])

  // Listen for SW update events
  useEffect(() => {
    const handleSwUpdate = (event) => {
      const { updateSW } = event.detail
      setUpdateCallback(() => updateSW)
      setShowUpdate(true)
    }
    
    window.addEventListener('swUpdate', handleSwUpdate)
    return () => window.removeEventListener('swUpdate', handleSwUpdate)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('app_token')
    localStorage.removeItem('app_user')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // If not logged in, show auth pages
  if (!user) {
    return (
      <>
        {showUpdate && updateCallback && (
          <UpdateModal 
            onUpdate={() => updateCallback(true)} 
            onDismiss={() => setShowUpdate(false)} 
          />
        )}
        <Router>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </>
    )
  }

  return (
    <>
      {showUpdate && updateCallback && (
        <UpdateModal 
          onUpdate={() => updateCallback(true)} 
          onDismiss={() => setShowUpdate(false)} 
        />
      )}
      <Router>
        <div className="app">
          <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} user={user} onLogout={handleLogout} />
          <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/formularios" element={<Services />} />
            <Route path="/formulario/:publicCode" element={<FormularioDetalle />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; 2026 DATA Formularios. Todos los derechos reservados.</p>
        </footer>
      </div>
      </Router>
    </>
  )
}

export default App
