function Services() {
  const services = [
    {
      icon: '📊',
      title: 'Análisis de Datos',
      description: 'Visualiza y analiza tus datos con gráficos interactivos y reportes detallados.'
    },
    {
      icon: '🔄',
      title: 'Sincronización',
      description: 'Mantén tus datos sincronizados en tiempo real en todos tus dispositivos.'
    },
    {
      icon: '📝',
      title: 'Formularios',
      description: 'Crea y gestiona formularios personalizados para cualquier necesidad.'
    },
    {
      icon: '🔔',
      title: 'Notificaciones',
      description: 'Recibe alertas y notificaciones push sobre eventos importantes.'
    },
    {
      icon: '👥',
      title: 'Colaboración',
      description: 'Trabaja en equipo con herramientas de colaboración integradas.'
    },
    {
      icon: '📁',
      title: 'Almacenamiento',
      description: 'Guarda y accede a tus archivos de forma segura en la nube.'
    }
  ]

  return (
    <div className="services-page fade-in">
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <h1>Nuestros Servicios</h1>
          <p>
            Soluciones completas para optimizar tu productividad y gestión de datos
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-image">
                  {service.icon}
                </div>
                <div className="service-content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <button className="btn btn-primary">
                    Ver más
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="stats">
        <div className="container text-center">
          <h2 style={{ color: 'white', marginBottom: '1rem' }}>
            ¿Listo para comenzar?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem' }}>
            Únete a miles de usuarios que ya confían en nosotros
          </p>
          <button className="btn btn-lg" style={{ background: 'white', color: '#800020' }}>
            Prueba Gratis
          </button>
        </div>
      </section>
    </div>
  )
}

export default Services
