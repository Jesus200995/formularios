import { useState } from 'react'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('¡Mensaje enviado! Te contactaremos pronto.')
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email',
      info: 'contacto@mobileapp.com'
    },
    {
      icon: '📱',
      title: 'Teléfono',
      info: '+52 55 1234 5678'
    },
    {
      icon: '📍',
      title: 'Ubicación',
      info: 'Ciudad de México, México'
    },
    {
      icon: '🕐',
      title: 'Horario',
      info: 'Lun - Vie: 9:00 AM - 6:00 PM'
    }
  ]

  return (
    <div className="contact-page fade-in">
      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <h1>Contáctanos</h1>
          <p>
            ¿Tienes preguntas? Estamos aquí para ayudarte
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="contact-grid">
          {/* Contact Form */}
          <div className="contact-form">
            <h3 style={{ marginBottom: '1.5rem' }}>Envíanos un mensaje</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Asunto</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="¿En qué podemos ayudarte?"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Mensaje</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Escribe tu mensaje aquí..."
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Enviar Mensaje
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <h3 style={{ marginBottom: '1.5rem' }}>Información de Contacto</h3>
            {contactInfo.map((item, index) => (
              <div key={index} className="contact-info-item">
                <div className="contact-icon">{item.icon}</div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.info}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section style={{ 
        background: 'var(--gray-200)', 
        height: '300px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--gray-500)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '4rem' }}>🗺️</span>
          <p>Mapa de ubicación</p>
        </div>
      </section>
    </div>
  )
}

export default Contact
