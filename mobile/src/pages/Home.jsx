import { Link } from 'react-router-dom'

function Home() {
  const features = [
    {
      icon: '⚡',
      title: 'Rápido',
      description: 'Rendimiento optimizado para una experiencia fluida en cualquier dispositivo.'
    },
    {
      icon: '🔒',
      title: 'Seguro',
      description: 'Tu información está protegida con los más altos estándares de seguridad.'
    },
    {
      icon: '📱',
      title: 'Responsivo',
      description: 'Diseño adaptable que se ve perfecto en móviles, tablets y escritorio.'
    },
    {
      icon: '🌐',
      title: 'Offline',
      description: 'Funciona sin conexión gracias a la tecnología PWA.'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Usuarios' },
    { number: '99.9%', label: 'Uptime' },
    { number: '50+', label: 'Funciones' },
    { number: '24/7', label: 'Soporte' }
  ]

  return (
    <div className="home fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenido a DATA Formularios</h1>
          <p>
            La mejor aplicación PWA para gestionar tus formularios. 
            Rápida, segura y disponible en cualquier dispositivo.
          </p>
          <div className="hero-buttons">
            <Link to="/services" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              Ver Formularios
            </Link>
            <Link to="/about" className="btn btn-secondary btn-lg" style={{ textDecoration: 'none' }}>
              Mi Perfil
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features">
        <div className="container">
          <div className="section-header">
            <h2>¿Por qué elegirnos?</h2>
            <p>Descubre las características que hacen única a nuestra aplicación</p>
          </div>
          <div className="grid grid-4">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
