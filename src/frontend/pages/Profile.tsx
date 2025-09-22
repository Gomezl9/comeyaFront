import React, { useEffect, useState } from 'react';
import './Profile.css';

const Profile: React.FC = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const parsed = savedUser ? JSON.parse(savedUser) : {};
    // Normalizar desde backend: { id, nombre, correo, rol_id }
    return {
      id: parsed.id || undefined,
      name: parsed.name || parsed.nombre || '',
      email: parsed.email || parsed.correo || '',
      roleId: typeof parsed.rol_id === 'number' ? parsed.rol_id : 2,
      phone: parsed.phone || '',
      address: parsed.address || ''
    };
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    role: (user.roleId === 1 ? 'Administrador' : 'Usuario') as 'Administrador' | 'Usuario'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleTextToId = (role: 'Administrador' | 'Usuario'): number => (role === 'Administrador' ? 1 : 2);
  const roleIdToText = (roleId?: number): 'Administrador' | 'Usuario' => (roleId === 1 ? 'Administrador' : 'Usuario');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const saved = localStorage.getItem('user');
        const token = localStorage.getItem('token') || '';
        const parsed = saved ? JSON.parse(saved) : null;
        const userId = parsed?.id;
        if (!userId) return;
        const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('No se pudo cargar el usuario');
        const data = await res.json();
        // data esperado: { id, nombre, correo, rol_id }
        const merged = {
          id: data.id,
          name: data.nombre || '',
          email: data.correo || '',
          roleId: typeof data.rol_id === 'number' ? data.rol_id : 2,
          phone: user.phone || '',
          address: user.address || ''
        };
        setUser(merged);
        setFormData({
          name: merged.name,
          email: merged.email,
          phone: merged.phone,
          address: merged.address,
          role: roleIdToText(merged.roleId)
        });
        // Persistir también en localStorage con campos extendidos para el front
        localStorage.setItem('user', JSON.stringify({
          id: merged.id,
          nombre: merged.name,
          correo: merged.email,
          rol_id: merged.roleId,
          phone: merged.phone,
          address: merged.address
        }));
      } catch (e: any) {
        setError(e?.message || 'Error al cargar usuario');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user?.id) throw new Error('Usuario no identificado');
      const token = localStorage.getItem('token') || '';
      const payload = {
        nombre: formData.name,
        correo: formData.email,
        rol_id: roleTextToId(formData.role)
        // Nota: contraseña no se actualiza desde este formulario
      };
      const res = await fetch(`http://localhost:3000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || 'No se pudo actualizar el usuario');
      }
      await res.json();
      const updatedUser = {
        id: user.id,
        name: formData.name,
        email: formData.email,
        roleId: roleTextToId(formData.role),
        phone: formData.phone, // solo front
        address: formData.address // solo front
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify({
        id: updatedUser.id,
        nombre: updatedUser.name,
        correo: updatedUser.email,
        rol_id: updatedUser.roleId,
        phone: updatedUser.phone,
        address: updatedUser.address
      }));
      setIsEditing(false);
      alert('Perfil actualizado exitosamente');
    } catch (e: any) {
      setError(e?.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      role: roleIdToText(user.roleId)
    });
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Mi Perfil</h1>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="edit-btn"
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      {error && (
        <div className="error-banner">{error}</div>
      )}

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2>{user.name || 'Usuario'}</h2>
            <p className="user-role">{roleIdToText(user.roleId)}</p>
          </div>

          <div className="profile-info">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+51 999 999 999"
                  />
                </div>

                <div className="form-group">
                  <label>Dirección</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Tu dirección completa"
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button onClick={handleSave} className="save-btn" disabled={loading}>
                    Guardar Cambios
                  </button>
                  <button onClick={handleCancel} className="cancel-btn">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-display">
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{user.email || 'No especificado'}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Teléfono:</span>
                  <span className="info-value">{user.phone || 'No especificado'}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Dirección:</span>
                  <span className="info-value">{user.address || 'No especificada'}</span>
                </div>

                <div className="info-item">
                  <span className="info-label">Rol:</span>
                  <span className="info-value">{roleIdToText(user.roleId)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

