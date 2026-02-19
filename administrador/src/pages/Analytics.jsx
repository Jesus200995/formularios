import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { 
  HiOutlineTrendingUp, 
  HiOutlineClock, 
  HiOutlineRefresh, 
  HiOutlineStar,
  HiOutlineGlobe
} from 'react-icons/hi'

function Analytics() {
  const monthlyData = [
    { name: 'Ene', usuarios: 1200, respuestas: 4500 },
    { name: 'Feb', usuarios: 1450, respuestas: 5200 },
    { name: 'Mar', usuarios: 1800, respuestas: 6100 },
    { name: 'Abr', usuarios: 2100, respuestas: 7300 },
    { name: 'May', usuarios: 2400, respuestas: 8200 },
    { name: 'Jun', usuarios: 2543, respuestas: 9100 }
  ]

  const deviceData = [
    { name: 'Android', value: 55, color: '#800020' },
    { name: 'iOS', value: 35, color: '#a3324d' },
    { name: 'Web', value: 10, color: '#d4637a' }
  ]

  const hourlyData = [
    { hour: '00:00', active: 45 },
    { hour: '04:00', active: 23 },
    { hour: '08:00', active: 120 },
    { hour: '12:00', active: 280 },
    { hour: '16:00', active: 350 },
    { hour: '20:00', active: 210 },
    { hour: '23:00', active: 85 }
  ]

  const topCountries = [
    { country: 'México', flag: 'MX', users: 1250, percentage: 49 },
    { country: 'Colombia', flag: 'CO', users: 520, percentage: 20 },
    { country: 'Argentina', flag: 'AR', users: 380, percentage: 15 },
    { country: 'España', flag: 'ES', users: 250, percentage: 10 },
    { country: 'Chile', flag: 'CL', users: 143, percentage: 6 }
  ]

  return (
    <div className="analytics-page fade-in">
      <div className="page-header">
        <h1>Analíticas</h1>
        <p>Métricas y estadísticas detalladas de la aplicación</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><HiOutlineTrendingUp size={24} /></div>
          <div className="stat-content">
            <h3>+45%</h3>
            <p>Crecimiento Mensual</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><HiOutlineClock size={24} /></div>
          <div className="stat-content">
            <h3>4.5 min</h3>
            <p>Tiempo Promedio</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><HiOutlineRefresh size={24} /></div>
          <div className="stat-content">
            <h3>78%</h3>
            <p>Tasa de Retención</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info"><HiOutlineStar size={24} /></div>
          <div className="stat-content">
            <h3>4.8</h3>
            <p>Calificación</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="card">
          <div className="card-header">
            <h3>Crecimiento de Usuarios</h3>
            <select className="form-control" style={{ width: 'auto' }}>
              <option>Últimos 6 meses</option>
              <option>Último año</option>
            </select>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="usuarios" 
                    stroke="#800020" 
                    fill="rgba(128, 0, 32, 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Distribución por Dispositivo</h3>
          </div>
          <div className="card-body">
            <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Actividad por Hora</h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="active" 
                    stroke="#800020" 
                    strokeWidth={3}
                    dot={{ fill: '#800020', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Usuarios por País</h3>
          </div>
          <div className="card-body">
            {topCountries.map((country, index) => (
              <div key={index} style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HiOutlineGlobe size={16} /> {country.country}
                  </span>
                  <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{country.users} usuarios</span>
                </div>
                <div style={{ 
                  height: '8px', 
                  background: 'var(--gray-200)', 
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${country.percentage}%`, 
                    height: '100%', 
                    background: 'var(--primary-gradient)',
                    borderRadius: 'var(--radius-full)'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
