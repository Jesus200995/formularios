import { useState, useEffect } from 'react'
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi'

const API_URL = import.meta.env.VITE_API_URL || 'https://apidata.geodatos.com.mx/api'

function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        setError('Error al cargar usuarios')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }
  
  const filteredUsers = users.filter(user => 
    (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    return status ? 
      <span className="badge badge-success">Activo</span> : 
      <span className="badge badge-danger">Inactivo</span>
  }

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="badge badge-info">Administrador</span>
    }
    return <span className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>Usuario</span>
  }

  return (
    <div className="users-page fade-in">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <p>Administra los usuarios de la aplicación móvil</p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 'var(--spacing-lg)' }}>
          {error}
        </div>
      )}

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
          <button className="btn btn-primary" onClick={() => window.location.href = '/register'}>
            <HiOutlinePlus size={16} /> Nuevo Usuario
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--gray-500)' }}>
              Cargando usuarios...
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>CURP</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--gray-500)' }}>
                        {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
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
                              {(user.full_name || user.email)?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500 }}>{user.full_name || 'Sin nombre'}</div>
                              {user.first_name && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                  {user.first_name} {user.last_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.curp || '-'}</td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>{getStatusBadge(user.is_active)}</td>
                        <td>{new Date(user.created_at).toLocaleDateString('es-MX')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-sm btn-secondary"><HiOutlinePencil size={14} /></button>
                            <button className="btn btn-sm btn-secondary"><HiOutlineTrash size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && users.length > 0 && (
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
            <button className="btn btn-sm btn-secondary" disabled>← Anterior</button>
            <button className="btn btn-sm btn-secondary" disabled>Siguiente →</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
