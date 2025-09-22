import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ComedoresList.css';
import { useAuth } from '../hooks/useAuth';

// Función para obtener el ID del usuario actual desde el token
const getCurrentUserId = (): number | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No hay token en localStorage');
      return null;
    }
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token decodificado completo:', payload);
    console.log('Campos disponibles:', Object.keys(payload));
    console.log('ID del usuario:', payload.id);
    console.log('user_id:', payload.user_id);
    console.log('userId:', payload.userId);
    console.log('user:', payload.user);
    
    // Intentar diferentes nombres de campo para el ID
    const userId = payload.id || 
                   payload.user_id || 
                   payload.userId || 
                   payload.sub || 
                   (payload.user && payload.user.id) ||
                   (payload.data && payload.data.id) ||
                   (payload.userData && payload.userData.id);
    
    console.log('ID encontrado:', userId);
    return userId || null;
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
};

interface Comedor {
  id: number;
  nombre: string;
  direccion: string;
  horarios?: string;
  latitud?: number;
  longitud?: number;
  creado_por: number;
  activo: boolean;
}

const ComedoresList: React.FC = () => {
  const { isAdmin } = useAuth();
  const [comedores, setComedores] = useState<Comedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Comedor>>({});
  const [saving, setSaving] = useState(false);
  const [comedoresEstados, setComedoresEstados] = useState<Record<number, boolean>>({});
  const [currentUserId] = useState(getCurrentUserId());

  // Función para verificar si el usuario puede editar un comedor
  const canEditComedor = (comedor: Comedor): boolean => {
    return isAdmin;
  };

  useEffect(() => {
    fetchComedores();
  }, []);

  // Escuchar cambios en comedores desde otros componentes
  useEffect(() => {
    const handleComedoresUpdate = () => {
      console.log('Se detectó un cambio en comedores, actualizando estados...');
      // Recargar estados desde localStorage
      const nuevosEstados: Record<number, boolean> = {};
      comedores.forEach(comedor => {
        const estadoGuardado = localStorage.getItem(`comedor_${comedor.id}_activo`);
        nuevosEstados[comedor.id] = estadoGuardado ? JSON.parse(estadoGuardado) : true;
      });
      setComedoresEstados(nuevosEstados);
    };

    window.addEventListener('comedoresUpdated', handleComedoresUpdate);
    return () => window.removeEventListener('comedoresUpdated', handleComedoresUpdate);
  }, [comedores]);

  const fetchComedores = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token'); // si tu backend usa JWT
      const response = await fetch('http://localhost:3000/api/comedores', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComedores(data);
        
        // Inicializar estados desde localStorage
        const estadosIniciales: Record<number, boolean> = {};
        data.forEach((comedor: Comedor) => {
          const estadoGuardado = localStorage.getItem(`comedor_${comedor.id}_activo`);
          estadosIniciales[comedor.id] = estadoGuardado ? JSON.parse(estadoGuardado) : true;
        });
        setComedoresEstados(estadosIniciales);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Error al cargar comedores');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (comedor: Comedor) => {
    setEditingId(comedor.id);
    setEditForm({
      nombre: comedor.nombre,
      direccion: comedor.direccion,
      horarios: comedor.horarios || '',
      latitud: comedor.latitud || 0,
      longitud: comedor.longitud || 0,
      activo: comedoresEstados[comedor.id] !== undefined ? comedoresEstados[comedor.id] : true
    });
  };

  const handleSave = async () => {
    if (editingId) {
      try {
        setSaving(true);
        const token = localStorage.getItem('token');
        
        // Separar el campo activo del resto de datos para no enviarlo al backend
        const { activo, ...datosParaBackend } = editForm;
        
        const response = await fetch(`http://localhost:3000/api/comedores/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(datosParaBackend),
        });

        if (response.ok) {
          // Actualizar el estado local solo si la petición fue exitosa
          setComedores(comedores.map(c => 
            c.id === editingId ? { ...c, ...datosParaBackend } : c
          ));
          
          // Actualizar el estado activo localmente
          if (activo !== undefined) {
            setComedoresEstados(prev => ({
              ...prev,
              [editingId]: activo
            }));
            localStorage.setItem(`comedor_${editingId}_activo`, JSON.stringify(activo));
          }
          
          setEditingId(null);
          setEditForm({});
          
          // Notificar a otros componentes que los comedores han cambiado
          localStorage.setItem('comedoresUpdated', Date.now().toString());
          window.dispatchEvent(new Event('comedoresUpdated'));
          
          alert('Comedor actualizado exitosamente');
        } else {
          const errData = await response.json();
          alert(errData.message || 'Error al actualizar comedor');
        }
      } catch (err) {
        alert('Error de conexión al guardar cambios');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleInputChange = (field: keyof Comedor, value: string | number | boolean) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="comedores-container">
        <div className="loading">Cargando comedores...</div>
      </div>
    );
  }

  return (
    <div className="comedores-container">
      <header className="comedores-header">
        <h1>Lista de Comedores</h1>
        {isAdmin && (
          <Link to="/comedores/crear" className="btn-primary">
            ➕ Crear Nuevo Comedor
          </Link>
        )}
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="comedores-grid">
        {comedores.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <h3>No hay comedores registrados</h3>
            <p>Comienza creando tu primer comedor comunitario</p>
            {isAdmin && (
              <Link to="/comedores/crear" className="btn-primary">
                Crear Comedor
              </Link>
            )}
          </div>
        ) : (
          comedores.map((comedor) => (
            <div key={comedor.id} className={`comedor-card ${canEditComedor(comedor) ? 'editable' : 'read-only'}`}>
              <div className="comedor-header">
                {editingId === comedor.id ? (
                  <input
                    type="text"
                    value={editForm.nombre || ''}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="edit-input"
                    placeholder="Nombre del comedor"
                  />
                ) : (
                  <h3>{comedor.nombre}</h3>
                )}
                {canEditComedor(comedor) && (
                  <div className="comedor-actions">
                    {editingId === comedor.id ? (
                      <>
                        <button 
                          onClick={handleSave}
                          className="btn-save"
                          title="Guardar cambios"
                          disabled={saving}
                        >
                          {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button 
                          onClick={handleCancel}
                          className="btn-cancel"
                          title="Cancelar"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleEdit(comedor)}
                        className="btn-edit"
                        title="Editar comedor"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <div className="comedor-info">
                {editingId === comedor.id && canEditComedor(comedor) ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>📍 Dirección:</label>
                      <input
                        type="text"
                        value={editForm.direccion || ''}
                        onChange={(e) => handleInputChange('direccion', e.target.value)}
                        className="edit-input"
                        placeholder="Dirección del comedor"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>🕒 Horarios:</label>
                      <input
                        type="text"
                        value={editForm.horarios || ''}
                        onChange={(e) => handleInputChange('horarios', e.target.value)}
                        className="edit-input"
                        placeholder="Ej: Lunes a Viernes 12:00-14:00"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>🗺️ Latitud:</label>
                      <input
                        type="number"
                        step="any"
                        value={editForm.latitud || ''}
                        onChange={(e) => handleInputChange('latitud', parseFloat(e.target.value) || 0)}
                        className="edit-input"
                        placeholder="Latitud"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>🗺️ Longitud:</label>
                      <input
                        type="number"
                        step="any"
                        value={editForm.longitud || ''}
                        onChange={(e) => handleInputChange('longitud', parseFloat(e.target.value) || 0)}
                        className="edit-input"
                        placeholder="Longitud"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>📊 Estado:</label>
                      <select
                        value={editForm.activo ? 'true' : 'false'}
                        onChange={(e) => handleInputChange('activo', e.target.value === 'true')}
                        className="edit-select"
                      >
                        <option value="true">🟢 Activo</option>
                        <option value="false">🔴 Inactivo</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <p><strong>📍 Dirección:</strong> {comedor.direccion}</p>
                    <p><strong>📊 Estado:</strong> 
                      <span className={`status-badge ${comedoresEstados[comedor.id] ? 'status-active' : 'status-inactive'}`}>
                        {comedoresEstados[comedor.id] ? '🟢 Activo' : '🔴 Inactivo'}
                      </span>
                    </p>
                    {comedor.horarios && (
                      <p><strong>🕒 Horarios:</strong> {comedor.horarios}</p>
                    )}
                    {comedor.latitud && comedor.longitud && (
                      <p><strong>🗺️ Coordenadas:</strong> {comedor.latitud}, {comedor.longitud}</p>
                    )}
                    <p><strong>👤 Creado por:</strong> 
                      {comedor.creado_por === currentUserId ? (
                        <span style={{ color: '#667eea', fontWeight: 'bold' }}>Tú</span>
                      ) : (
                        `Usuario #${comedor.creado_por}`
                      )}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComedoresList;
