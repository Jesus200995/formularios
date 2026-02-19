function About() {
  const team = [
    { name: 'María García', role: 'CEO & Fundadora', emoji: '👩‍💼' },
    { name: 'Carlos López', role: 'CTO', emoji: '👨‍💻' },
    { name: 'Ana Martínez', role: 'Diseñadora UX', emoji: '👩‍🎨' },
    { name: 'Luis Rodríguez', role: 'Desarrollador', emoji: '👨‍💻' }
  ]

  return (
    <div className="about-page fade-in">
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <h1>Sobre Nosotros</h1>
          <p>
            Conoce la historia detrás de Mobile App y el equipo que hace posible tu experiencia
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="about-content">
        <div className="about-grid">
          <div className="about-image">
            🚀
          </div>
          <div className="about-text">
            <h2>Nuestra Misión</h2>
            <p>
              En Mobile App, nos dedicamos a crear soluciones tecnológicas que simplifican 
              la vida de nuestros usuarios. Creemos que la tecnología debe ser accesible, 
              intuitiva y poderosa.
            </p>
            <p>
              Desde nuestra fundación en 2024, hemos ayudado a miles de personas y 
              empresas a optimizar sus procesos con herramientas innovadoras.
            </p>
            <ul className="values-list">
              <li>Innovación constante</li>
              <li>Experiencia de usuario excepcional</li>
              <li>Seguridad y privacidad</li>
              <li>Soporte dedicado 24/7</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section" style={{ background: 'var(--gray-100)' }}>
        <div className="container">
          <div className="section-header">
            <h2>Nuestro Equipo</h2>
            <p>Profesionales apasionados por crear productos excepcionales</p>
          </div>
          <div className="grid grid-4">
            {team.map((member, index) => (
              <div key={index} className="card" style={{ textAlign: 'center' }}>
                <div className="card-body">
                  <div style={{ 
                    fontSize: '4rem', 
                    marginBottom: '1rem',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {member.emoji}
                  </div>
                  <h4>{member.name}</h4>
                  <p style={{ color: 'var(--primary)', margin: 0 }}>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">2024</span>
            <span className="stat-label">Fundación</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">15+</span>
            <span className="stat-label">Empleados</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Usuarios</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5</span>
            <span className="stat-label">Países</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
