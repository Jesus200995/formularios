import { useState } from 'react'
import { 
  HiOutlineCog, 
  HiOutlineBell, 
  HiOutlineLockClosed, 
  HiOutlineAdjustments,
  HiOutlineTrash,
  HiOutlineUpload,
  HiOutlineSave
} from 'react-icons/hi'

function Settings() {
  const [settings, setSettings] = useState({
    appName: 'Mobile App',
    appDescription: 'Aplicación móvil PWA moderna',
    primaryColor: '#800020',
    emailNotifications: true,
    pushNotifications: true,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true
  })

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    alert('Configuración guardada correctamente')
  }

  return (
    <div className="settings-page fade-in">
      <div className="page-header">
        <h1>Configuración</h1>
        <p>Personaliza la configuración de la aplicación</p>
      </div>

      <div className="grid grid-2">
        {/* General Settings */}
        <div className="card">
          <div className="card-header">
            <h3><HiOutlineCog size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Configuración General</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>Nombre de la Aplicación</label>
              <input
                type="text"
                className="form-control"
                value={settings.appName}
                onChange={(e) => handleChange('appName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                className="form-control"
                rows="3"
                value={settings.appDescription}
                onChange={(e) => handleChange('appDescription', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Color Principal</label>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  style={{ width: '50px', height: '40px', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={settings.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <h3><HiOutlineBell size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Notificaciones</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: 'var(--spacing-md)',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <p style={{ fontWeight: 500, margin: 0 }}>Notificaciones por Email</p>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Recibir alertas por correo</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                />
              </label>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: 'var(--spacing-md)',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <p style={{ fontWeight: 500, margin: 0 }}>Notificaciones Push</p>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Alertas en tiempo real</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="card-header">
            <h3><HiOutlineLockClosed size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Seguridad</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: 'var(--spacing-md)',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <p style={{ fontWeight: 500, margin: 0 }}>Permitir Registro</p>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Nuevos usuarios pueden registrarse</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowRegistration}
                  onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                />
              </label>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: 'var(--spacing-md)',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div>
                  <p style={{ fontWeight: 500, margin: 0 }}>Verificación de Email</p>
                  <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Requerir verificación al registrarse</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="card">
          <div className="card-header">
            <h3><HiOutlineAdjustments size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Mantenimiento</h3>
          </div>
          <div className="card-body">
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: 'var(--spacing-md)',
              background: settings.maintenanceMode ? 'var(--warning-light)' : 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-md)'
            }}>
              <div>
                <p style={{ fontWeight: 500, margin: 0 }}>Modo Mantenimiento</p>
                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Los usuarios verán una página de mantenimiento</span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--warning)' }}
              />
            </label>

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }}>
                <HiOutlineTrash size={16} /> Limpiar Caché
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }}>
                <HiOutlineUpload size={16} /> Exportar Datos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'right' }}>
        <button className="btn btn-primary btn-lg" onClick={handleSave}>
          <HiOutlineSave size={18} /> Guardar Cambios
        </button>
      </div>
    </div>
  )
}

export default Settings
