import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import './Reservas.css';
import { Comedor } from '../../types/comedor';

  interface Reserva {
    id: number;
    usuario_id: number;
    comedor_id: number;
    fecha: string;
    hora: string;
    personas: number;
    estado?: string;
  }

const Reservas: React.FC = () => {
  const [comedores, setComedores] = useState<Comedor[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('');
  const [personas, setPersonas] = useState('');
  const [comedorId, setComedorId] = useState('');
  // Obtener usuario logueado desde localStorage
  const [usuarioLogueadoId, setUsuarioLogueadoId] = useState<number | null>(null);
  const [usuarioId, setUsuarioId] = useState('');
  const [estado, setEstado] = useState('pendiente');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'nueva' | 'mis-reservas' | 'confirmar-reservas'>('nueva');
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    // Obtener usuario del localStorage
    const userStr = localStorage.getItem('user');
    console.log('Usuario del localStorage:', userStr);
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Usuario parseado:', user);
        
        if (user.id) {
          setUsuarioLogueadoId(user.id);
          setUsuarioId(user.id.toString());
          console.log('Usuario ID establecido:', user.id);
        } else {
          console.error('No se encontró ID en el usuario');
        }
      } catch (e) {
        console.error('Error al parsear usuario:', e);
      }
    } else {
      console.error('No hay usuario en localStorage');
    }

    const fetchComedores = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/comedores', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        setComedores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar comedores:', error);
        setComedores([]);
      }
    };

    const fetchReservas = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/reservas', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        setReservas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar reservas:', error);
        setReservas([]);
      }
    };

    fetchComedores();
    fetchReservas();
  }, []);

  const validateForm = () => {
    console.log('Validando formulario:', {
      fecha,
      hora,
      personas,
      comedorId,
      usuarioLogueadoId
    });
    
    if (!fecha) {
      alert('La fecha es requerida');
      return false;
    }
    if (!hora) {
      alert('La hora es requerida');
      return false;
    }
    if (!personas.trim()) {
      alert('El número de personas es requerido');
      return false;
    }
    if (parseInt(personas) <= 0) {
      alert('Debe ser al menos 1 persona');
      return false;
    }
    if (!comedorId) {
      alert('Debe seleccionar un comedor');
      return false;
    }
    if (!usuarioLogueadoId) {
      alert('Usuario no identificado. Por favor, inicia sesión nuevamente');
      return false;
    }

    const selectedDate = new Date(fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      alert('No se pueden hacer reservas para fechas pasadas');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Formulario enviado');
    
    if (!validateForm()) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }
    
    if (!usuarioLogueadoId) {
      alert('Debes iniciar sesión para hacer reservas');
      return;
    }

    console.log('Datos de la reserva:', {
      usuario_id: usuarioLogueadoId,
      comedor_id: parseInt(comedorId),
      fecha,
      hora,
      personas: parseInt(personas),
      estado
    });

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      let response;
      const reservaPayload = {
        usuario_id: usuarioLogueadoId,
        comedor_id: parseInt(comedorId),
        fecha,
        hora,
        personas: parseInt(personas),
        estado
      };
      
      console.log('Enviando petición:', reservaPayload);
      
      if (editId) {
        response = await fetch(`http://localhost:3000/api/reservas/${editId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(reservaPayload),
        });
      } else {
        response = await fetch('http://localhost:3000/api/reservas', {
          method: 'POST',
          headers,
          body: JSON.stringify(reservaPayload),
        });
      }
      
      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('Respuesta exitosa:', responseData);
      
      alert(editId ? '¡Reserva actualizada exitosamente!' : '¡Reserva registrada exitosamente! 🎉');
      setHora(''); setPersonas(''); setComedorId(''); setEstado('pendiente');
      setActiveTab('mis-reservas');
      setEditId(null);
      
      // Recargar reservas
      const reservasResponse = await fetch('http://localhost:3000/api/reservas', { headers });
      if (reservasResponse.ok) {
        const reservasData = await reservasResponse.json();
        setReservas(Array.isArray(reservasData) ? reservasData : []);
      }
    } catch (error: any) {
      console.error('Error al enviar reserva:', error);
      alert(error.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // ...existing code...
  // Funciones para color e icono de estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return '#27ae60';
      case 'pendiente': return '#f39c12';
      case 'cancelada': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'confirmada': return '✅';
      case 'pendiente': return '⏳';
      case 'cancelada': return '❌';
      default: return '❓';
    }
  };
  return (
    <Layout>
      <div className="reservas-container">
        <div className="reservas-header">
          <h1>📅 Sistema de Reservas</h1>
          <p>Reserva tu lugar en los comedores comunitarios</p>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button className={`tab ${activeTab === 'nueva' ? 'active' : ''}`} onClick={() => setActiveTab('nueva')}>🆕 Nueva Reserva</button>
            <button className={`tab ${activeTab === 'mis-reservas' ? 'active' : ''}`} onClick={() => setActiveTab('mis-reservas')}>📋 Mis Reservas</button>
            <button className={`tab ${activeTab === 'confirmar-reservas' ? 'active' : ''}`} onClick={() => setActiveTab('confirmar-reservas')}>✅ Confirmar Reservas</button>
          </div>
        </div>
        {activeTab === 'confirmar-reservas' && (
          <div className="reservas-list-section">
            <h2>✅ Confirmar Reservas</h2>
            {/* Filtrar reservas hechas a comedores creados por el usuario logueado */}
            {usuarioLogueadoId && reservas.filter(r => {
              const comedor = comedores.find(c => c.id === r.comedor_id);
              return comedor && comedor.creado_por === usuarioLogueadoId;
            }).length > 0 ? (
              <div className="reservas-list">
                {reservas.filter(r => {
                  const comedor = comedores.find(c => c.id === r.comedor_id);
                  return comedor && comedor.creado_por === usuarioLogueadoId;
                }).map(r => {
                  const comedor = comedores.find(c => c.id === r.comedor_id);
                  return (
                    <div key={r.id} className="reserva-card">
                      <div className="reserva-header">
                        <div className="reserva-info">
                          <h3>{comedor ? comedor.nombre : `Comedor #${r.comedor_id}`}</h3>
                          <p>📅 {new Date(r.fecha).toLocaleDateString()} a las {r.hora}</p>
                        </div>
                        <div className="reserva-estado" style={{ backgroundColor: getEstadoColor(r.estado || '') }}>
                          {getEstadoIcon(r.estado || '')} {r.estado?.toUpperCase()}
                        </div>
                      </div>
                      <div className="reserva-details">
                        <p>👥 Personas: {r.personas}</p>
                        <p>Usuario ID: {r.usuario_id}</p>
                      </div>
                      <div style={{marginTop:8,display:'flex',gap:8}}>
                        {r.estado === 'pendiente' && (
                          <>
                            <button type="button" className="submit-button" style={{background:'#27ae60'}} onClick={async()=>{
                              console.log('Click confirmar', r.id);
                              setLoading(true);
                              try{
                                const token = localStorage.getItem('token');
                                const headers = {
                                  'Content-Type':'application/json',
                                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                };
                                const payload = {
                                  usuario_id: r.usuario_id,
                                  comedor_id: r.comedor_id,
                                  fecha: r.fecha,
                                  hora: r.hora,
                                  personas: r.personas,
                                  estado: 'confirmada'
                                };
                                const resp = await fetch(`http://localhost:3000/api/reservas/${r.id}`,{
                                  method:'PUT',
                                  headers,
                                  body:JSON.stringify(payload)
                                });
                                if(!resp.ok) {
                                  const err = await resp.json().catch(()=>({}));
                                  throw new Error(err?.message || `Error ${resp.status}`);
                                }
                                // Recargar reservas
                                const reservasResponse = await fetch('http://localhost:3000/api/reservas', { headers });
                                if (reservasResponse.ok) {
                                  const reservasData = await reservasResponse.json();
                                  setReservas(Array.isArray(reservasData) ? reservasData : []);
                                }
                                alert('Reserva confirmada');
                              }catch(e:any){
                                console.error('Confirmar error:', e);
                                alert(e?.message || 'Error al confirmar la reserva');
                              }finally{
                                setLoading(false);
                              }
                            }}>Confirmar</button>
                            <button type="button" className="submit-button" style={{background:'#e74c3c'}} onClick={async()=>{
                              console.log('Click cancelar', r.id);
                              setLoading(true);
                              try{
                                const token = localStorage.getItem('token');
                                const headers = {
                                  'Content-Type':'application/json',
                                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                };
                                const payload = {
                                  usuario_id: r.usuario_id,
                                  comedor_id: r.comedor_id,
                                  fecha: r.fecha,
                                  hora: r.hora,
                                  personas: r.personas,
                                  estado: 'cancelada'
                                };
                                const resp = await fetch(`http://localhost:3000/api/reservas/${r.id}`,{
                                  method:'PUT',
                                  headers,
                                  body:JSON.stringify(payload)
                                });
                                if(!resp.ok) {
                                  const err = await resp.json().catch(()=>({}));
                                  throw new Error(err?.message || `Error ${resp.status}`);
                                }
                                // Recargar reservas
                                const reservasResponse = await fetch('http://localhost:3000/api/reservas', { headers });
                                if (reservasResponse.ok) {
                                  const reservasData = await reservasResponse.json();
                                  setReservas(Array.isArray(reservasData) ? reservasData : []);
                                }
                                alert('Reserva cancelada');
                              }catch(e:any){
                                console.error('Cancelar error:', e);
                                alert(e?.message || 'Error al cancelar la reserva');
                              }finally{
                                setLoading(false);
                              }
                            }}>Cancelar</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No tienes reservas pendientes para tus comedores</p>
            )}
          </div>
        )}

        {/* El formulario siempre se muestra en la pestaña 'nueva', tanto para crear como para editar */}
        {activeTab === 'nueva' && (
          <div className="form-section">
            <form onSubmit={handleSubmit} className="reserva-form">
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="comedor_id">🏢 Comedor</label>
                  <select id="comedor_id" value={comedorId} onChange={e => setComedorId(e.target.value)} required>
                    <option value="">Selecciona un comedor</option>
                    {comedores.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="fecha">📅 Fecha</label>
                  <input type="date" id="fecha" value={fecha} onChange={e => setFecha(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label htmlFor="hora">🕐 Hora</label>
                  <input type="time" id="hora" value={hora} onChange={e => setHora(e.target.value)} required />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="personas">👥 Personas</label>
                  <input type="number" id="personas" value={personas} onChange={e => setPersonas(e.target.value)} min={1} required />
                </div>
              </div>
              {/* Usuario autocompletado y oculto */}
              <input type="hidden" id="usuario_id" value={usuarioId} readOnly />
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? <>Procesando...</> : (editId ? '💾 Guardar Cambios' : '📅 Confirmar Reserva')}
              </button>
              {editId && (
                <button type="button" className="submit-button" style={{background:'#aaa',marginLeft:8}} onClick={() => {
                  setEditId(null);
                  setHora(''); setPersonas(''); setComedorId(''); setEstado('pendiente');
                }}>Cancelar edición</button>
              )}
            </form>
          </div>
        )}

        {activeTab === 'mis-reservas' && (
          <div className="reservas-list-section">
            <h2>📋 Mis Reservas</h2>
            {usuarioLogueadoId && reservas.filter(r => r.usuario_id === usuarioLogueadoId).length > 0 ? (
              <div className="reservas-list">
                {reservas.filter(r => r.usuario_id === usuarioLogueadoId).map(r => {
                  const comedor = comedores.find(c => c.id === r.comedor_id);
                  return (
                    <div key={r.id} className="reserva-card">
                      <div className="reserva-header">
                        <div className="reserva-info">
                          <h3>{comedor ? comedor.nombre : `Comedor #${r.comedor_id}`}</h3>
                          <p>📅 {new Date(r.fecha).toLocaleDateString()} a las {r.hora}</p>
                        </div>
                        <div className="reserva-estado" style={{ backgroundColor: getEstadoColor(r.estado || '') }}>
                          {getEstadoIcon(r.estado || '')} {r.estado?.toUpperCase()}
                        </div>
                      </div>
                      <div className="reserva-details">
                        <p>👥 Personas: {r.personas}</p>
                        <p>🏢 Comedor: {comedor ? comedor.nombre : r.comedor_id}</p>
                      </div>
                      <div style={{marginTop:8,display:'flex',gap:8}}>
                        <button className="submit-button" style={{background:'#f39c12'}} onClick={()=>{
                          setActiveTab('nueva');
                          setEditId(r.id);
                          setFecha(r.fecha);
                          setHora(r.hora);
                          setPersonas(r.personas.toString());
                          setComedorId(r.comedor_id.toString());
                          setEstado(r.estado || 'pendiente');
                        }}>✏️ Editar</button>
                        <button className="submit-button" style={{background:'#e74c3c'}} onClick={async()=>{
                          if(window.confirm('¿Seguro que deseas eliminar esta reserva?')){
                            setLoading(true);
                            try{
                              const token = localStorage.getItem('token');
                              const headers = {
                                'Content-Type':'application/json',
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                              };
                              const resp = await fetch(`http://localhost:3000/api/reservas/${r.id}`,{
                                method:'DELETE',
                                headers
                              });
                              if(!resp.ok) throw new Error();
                              // Recargar reservas
                              const reservasResponse = await fetch('http://localhost:3000/api/reservas', { headers });
                              if (reservasResponse.ok) {
                                const reservasData = await reservasResponse.json();
                                setReservas(Array.isArray(reservasData) ? reservasData : []);
                              }
                              alert('Reserva eliminada correctamente');
                            }catch{
                              alert('Error al eliminar la reserva');
                            }finally{
                              setLoading(false);
                            }
                          }
                        }}>🗑️ Eliminar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No tienes reservas registradas</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reservas;
