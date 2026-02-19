import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { 
  HiOutlineUsers, 
  HiOutlineDocumentText, 
  HiOutlineChartBar, 
  HiOutlineLightningBolt,
  HiOutlineUser,
  HiOutlineCheckCircle,
  HiOutlineCog
} from 'react-icons/hi'

function Dashboard() {
  const stats = [
    { icon: <HiOutlineUsers size={24} />, label: 'Usuarios Totales', value: '2,543', change: '+12%', changeType: 'positive', color: 'primary' },
    { icon: <HiOutlineDocumentText size={24} />, label: 'Formularios', value: '156', change: '+8%', changeType: 'positive', color: 'success' },
    { icon: <HiOutlineChartBar size={24} />, label: 'Respuestas Hoy', value: '432', change: '-3%', changeType: 'negative', color: 'warning' },
    { icon: <HiOutlineLightningBolt size={24} />, label: 'Activos Ahora', value: '89', change: '+25%', changeType: 'positive', color: 'info' }
  ]

  const chartData = [
    { name: 'Lun', usuarios: 120, respuestas: 240 },
    { name: 'Mar', usuarios: 150, respuestas: 320 },
    { name: 'Mié', usuarios: 180, respuestas: 280 },
    { name: 'Jue', usuarios: 200, respuestas: 400 },
    { name: 'Vie', usuarios: 250, respuestas: 380 },
    { name: 'Sáb', usuarios: 190, respuestas: 300 },
    { name: 'Dom', usuarios: 140, respuestas: 220 }
  ]

  const recentActivity = [
    { icon: <HiOutlineUser size={18} />, text: 'Nuevo usuario registrado: María García', time: 'Hace 5 min', color: 'primary' },
    { icon: <HiOutlineDocumentText size={18} />, text: 'Formulario "Encuesta 2026" creado', time: 'Hace 15 min', color: 'success' },
    { icon: <HiOutlineCheckCircle size={18} />, text: '45 nuevas respuestas recibidas', time: 'Hace 30 min', color: 'info' },
    { icon: <HiOutlineCog size={18} />, text: 'Configuración actualizada', time: 'Hace 1 hora', color: 'warning' },
    { icon: <HiOutlineUsers size={18} />, text: 'Usuario Carlos López activado', time: 'Hace 2 horas', color: 'primary' }
  ]

  const topForms = [
    { name: 'Encuesta de Satisfacción', responses: 1250, status: 'active' },
    { name: 'Registro de Eventos', responses: 890, status: 'active' },
    { name: 'Feedback de Producto', responses: 654, status: 'paused' },
    { name: 'Solicitud de Soporte', responses: 432, status: 'active' }
  ]

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Bienvenido al panel de administración de Mobile App</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
              <span className={`stat-change ${stat.changeType}`}>
                {stat.change} vs semana anterior
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="card">
          <div className="card-header">
            <h3>Actividad Semanal</h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                  <Line 
                    type="monotone" 
                    dataKey="usuarios" 
                    stroke="#800020" 
                    strokeWidth={2}
                    dot={{ fill: '#800020' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="respuestas" 
                    stroke="#a3324d" 
                    strokeWidth={2}
                    dot={{ fill: '#a3324d' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Respuestas por Día</h3>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                  <Bar dataKey="respuestas" fill="#800020" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Actividad Reciente</h3>
            <button className="btn btn-sm btn-secondary">Ver todo</button>
          </div>
          <div className="card-body">
            <ul className="activity-list">
              {recentActivity.map((activity, index) => (
                <li key={index} className="activity-item">
                  <div className={`activity-icon ${activity.color}`} style={{
                    background: activity.color === 'primary' ? 'rgba(128, 0, 32, 0.1)' : 
                               activity.color === 'success' ? 'var(--success-light)' :
                               activity.color === 'warning' ? 'var(--warning-light)' : 'var(--info-light)'
                  }}>
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <p>{activity.text}</p>
                    <span>{activity.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Formularios Populares</h3>
            <button className="btn btn-sm btn-secondary">Ver todos</button>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Respuestas</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {topForms.map((form, index) => (
                    <tr key={index}>
                      <td>{form.name}</td>
                      <td>{form.responses}</td>
                      <td>
                        <span className={`badge ${form.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                          {form.status === 'active' ? 'Activo' : 'Pausado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
