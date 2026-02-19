import { useState } from 'react'
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi'

function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const users = [
    { id: 1, name: 'María García', email: 'maria@ejemplo.com', role: 'Usuario', status: 'active', lastLogin: '2026-02-19' },
    { id: 2, name: 'Carlos López', email: 'carlos@ejemplo.com', role: 'Admin', status: 'active', lastLogin: '2026-02-19' },
    { id: 3, name: 'Ana Martínez', email: 'ana@ejemplo.com', role: 'Usuario', status: 'inactive', lastLogin: '2026-02-15' },
    { id: 4, name: 'Luis Rodríguez', email: 'luis@ejemplo.com', role: 'Editor', status: 'active', lastLogin: '2026-02-18' },
    { id: 5, name: 'Sofia Hernández', email: 'sofia@ejemplo.com', role: 'Usuario', status: 'pending', lastLogin: '2026-02-17' },
    { id: 6, name: 'Pedro Sánchez', email: 'pedro@ejemplo.com', role: 'Usuario', status: 'active', lastLogin: '2026-02-19' },
    { id: 7, name: 'Laura Torres', email: 'laura@ejemplo.com', role: 'Editor', status: 'active', lastLogin: '2026-02-16' },
    { id: 8, name: 'Miguel Díaz', email: 'miguel@ejemplo.com', role: 'Usuario', status: 'inactive', lastLogin: '2026-02-10' }
  ]

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <span className="badge badge-success">Activo</span>
      case 'inactive': return <span className="badge badge-danger">Inactivo</span>
      case 'pending': return <span className="badge badge-warning">Pendiente</span>
      default: return <span className="badge">{status}</span>
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin': return <span className="badge badge-info">Admin</span>
      case 'Editor': return <span className="badge badge-warning">Editor</span>
      default: return <span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>{role}</span>
    }
  }

  return (
    <div className="users-page fade-in">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <p>Administra los usuarios de la aplicación móvil</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary">
            <HiOutlinePlus size={16} /> Nuevo Usuario
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Último acceso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          background: 'var(--primary-gradient)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {user.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>{user.lastLogin}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-secondary"><HiOutlinePencil size={14} /></button>
                        <button className="btn btn-sm btn-secondary"><HiOutlineTrash size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: 'var(--spacing-lg)',
        fontSize: '0.875rem',
        color: 'var(--gray-500)'
      }}>
        <span>Mostrando {filteredUsers.length} de {users.length} usuarios</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-sm btn-secondary">← Anterior</button>
          <button className="btn btn-sm btn-primary">Siguiente →</button>
        </div>
      </div>
    </div>
  )
}

export default Users
