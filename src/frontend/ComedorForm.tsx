import React, { useState } from 'react';
import Mapa from './components/Mapa';
import { useNavigate } from 'react-router-dom';
import './ComedorForm.css';

const ComedorForm: React.FC = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [horarios, setHorarios] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!direccion.trim()) newErrors.direccion = 'La dirección es requerida';
    if (latitud && (parseFloat(latitud) < -90 || parseFloat(latitud) > 90))
      newErrors.latitud = 'La latitud debe estar entre -90 y 90';
    if (longitud && (parseFloat(longitud) < -180 || parseFloat(longitud) > 180))
      newErrors.longitud = 'La longitud debe estar entre -180 y 180';
    if (capacidad && parseInt(capacidad) <= 0)
      newErrors.capacidad = 'La capacidad debe ser mayor a 0';
    if (telefono && !/^[\+]?[1-9][\d]{0,15}$/.test(telefono.replace(/\s/g, '')))
      newErrors.telefono = 'Formato de teléfono inválido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Obtener el usuario logueado automáticamente
    // Recuperar el usuario logueado correctamente
    const userStr = localStorage.getItem('user');
    let userId = undefined;
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj && typeof userObj.id === 'number') userId = userObj.id;
      } catch {}
    }
    if (!userId) {
      alert('No hay usuario logueado. Por favor inicia sesión.');
      setLoading(false);
      return;
    }

    const data = {
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      horarios: horarios.trim() || undefined,
      latitud: latitud ? parseFloat(latitud) : undefined,
      longitud: longitud ? parseFloat(longitud) : undefined,
      capacidad: capacidad ? parseInt(capacidad) : undefined,
      telefono: telefono.trim() || undefined,
      creado_por: userId,
    };

    try {
      const response = await fetch('http://localhost:3000/api/comedores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        alert('¡Comedor registrado exitosamente! 🎉');
        navigate('/comedores'); // redirigir a lista
      } else {
        alert(result.message || 'Error al registrar comedor');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comedor-form">
      <div className="form-header">
        <h2>🍽️ Registrar Nuevo Comedor</h2>
        <p>Complete la información del comedor que desea registrar</p>
      </div>

      <div className="form-section">
        <h3>📝 Información Básica</h3>

        <div className="form-group">
          <label>Nombre *</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} className={errors.nombre ? 'error' : ''}/>
          {errors.nombre && <span className="error-message">{errors.nombre}</span>}
        </div>

        <div className="form-group">
          <label>Dirección *</label>
          <input value={direccion} onChange={e => setDireccion(e.target.value)} className={errors.direccion ? 'error' : ''}/>
          {errors.direccion && <span className="error-message">{errors.direccion}</span>}
        </div>

        <div className="form-group">
          <label>Horarios</label>
          <input value={horarios} onChange={e => setHorarios(e.target.value)}/>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Capacidad</label>
            <input type="number" value={capacidad} onChange={e => setCapacidad(e.target.value)} className={errors.capacidad ? 'error' : ''}/>
            {errors.capacidad && <span className="error-message">{errors.capacidad}</span>}
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} className={errors.telefono ? 'error' : ''}/>
            {errors.telefono && <span className="error-message">{errors.telefono}</span>}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>📍 Ubicación</h3>
        <p>Seleccione la ubicación del comedor haciendo clic en el mapa. Las coordenadas se llenarán automáticamente.</p>
        <div className="map-content responsive-map">
          <Mapa
            coordenadas={latitud && longitud ? { lat: parseFloat(latitud), lng: parseFloat(longitud) } : undefined}
            onCoordenadasChange={(coords: { lat: number; lng: number }) => {
              setLatitud(coords.lat.toString());
              setLongitud(coords.lng.toString());
            }}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Latitud</label>
            <input type="number" step="0.000001" value={latitud} onChange={e => setLatitud(e.target.value)} className={errors.latitud ? 'error' : ''}/>
            {errors.latitud && <span className="error-message">{errors.latitud}</span>}
          </div>
          <div className="form-group">
            <label>Longitud</label>
            <input type="number" step="0.000001" value={longitud} onChange={e => setLongitud(e.target.value)} className={errors.longitud ? 'error' : ''}/>
            {errors.longitud && <span className="error-message">{errors.longitud}</span>}
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Registrando...' : '🍽️ Registrar Comedor'}
        </button>
      </div>
    </form>
  );
};

export default ComedorForm;
