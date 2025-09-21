import React, { useState, useEffect } from 'react';
import './Map.css';
import Mapa from '../components/Mapa';
import { Comedor } from '../../types/comedor';

const Map: React.FC = () => {
  const [comedores, setComedores] = useState<Comedor[]>([]);
  const [selectedComedor, setSelectedComedor] = useState<Comedor | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapView] = useState<'map' | 'list'>('map');
  const [inventarios, setInventarios] = useState<any[]>([]);
  const [comedorServicios, setComedorServicios] = useState<any[]>([]);
  const [servicios, setServicios] = useState<any[]>([]);
  const [comedoresEstados, setComedoresEstados] = useState<Record<number, boolean>>({});

  const fetchComedores = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/comedores', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const data = await response.json();
      
      let comedoresData = [];
      if (Array.isArray(data)) {
        comedoresData = data;
      } else if (data.data && Array.isArray(data.data)) {
        comedoresData = data.data;
      } else {
        comedoresData = [];
      }

      // Inicializar todos los comedores como activos por defecto
      const estadosIniciales: Record<number, boolean> = {};
      comedoresData.forEach(comedor => {
        // Cargar estado desde localStorage si existe, sino activo por defecto
        const estadoGuardado = localStorage.getItem(`comedor_${comedor.id}_activo`);
        estadosIniciales[comedor.id] = estadoGuardado ? JSON.parse(estadoGuardado) : true;
      });

      setComedores(comedoresData);
      setComedoresEstados(estadosIniciales);
    } catch (error) {
      setComedores([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventariosYServicios = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const headers: Record<string, string> = { 'Authorization': `Bearer ${token}` };
      const [invRes, csRes, sRes] = await Promise.all([
        fetch('http://localhost:3000/api/inventarios', { headers }),
        fetch('http://localhost:3000/api/comedoresservicio', { headers }),
        fetch('http://localhost:3000/api/servicios', { headers })
      ]);
      const inv = await invRes.json().catch(() => []);
      const cs = await csRes.json().catch(() => []);
      const sv = await sRes.json().catch(() => []);
      setInventarios(Array.isArray(inv) ? inv : []);
      setComedorServicios(Array.isArray(cs) ? cs : []);
      setServicios(Array.isArray(sv) ? sv : []);
    } catch (e) {
      console.error('Error cargando inventarios/servicios', e);
      setInventarios([]);
      setComedorServicios([]);
      setServicios([]);
    }
  };

  useEffect(() => {
    fetchComedores();
    fetchInventariosYServicios();
  }, []);

  // Recargar comedores cuando la página se enfoque (cuando regresas de otra página)
  useEffect(() => {
    const handleFocus = () => {
      fetchComedores();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Escuchar cambios en comedores desde otros componentes
  useEffect(() => {
    let lastUpdateTime = localStorage.getItem('comedoresUpdated') || '0';

    const handleComedoresUpdate = () => {
      fetchComedores();
    };

    // Verificar cambios en localStorage cada 1 segundo
    const checkForUpdates = () => {
      const currentUpdateTime = localStorage.getItem('comedoresUpdated');
      if (currentUpdateTime && currentUpdateTime !== lastUpdateTime) {
        lastUpdateTime = currentUpdateTime;
        fetchComedores();
      }
    };

    window.addEventListener('comedoresUpdated', handleComedoresUpdate);
    const interval = setInterval(checkForUpdates, 1000);

    return () => {
      window.removeEventListener('comedoresUpdated', handleComedoresUpdate);
      clearInterval(interval);
    };
  }, []);

  // Debug: Log cuando cambien los comedores
  useEffect(() => {
    console.log('Comedores actualizados en el mapa:', comedores);
    comedores.forEach(comedor => {
      console.log(`Comedor ${comedor.nombre}: activo = ${comedoresEstados[comedor.id]}`);
    });
  }, [comedores, comedoresEstados]);

  const getStatusColor = (comedorId: number) => {
    const isActive = comedoresEstados[comedorId] !== undefined ? comedoresEstados[comedorId] : true;
    return isActive ? '#667eea' : '#ff6b6b';
  };

  const getStatusText = (comedorId: number) => {
    const isActive = comedoresEstados[comedorId] !== undefined ? comedoresEstados[comedorId] : true;
    return isActive ? '🟢 Activo' : '🔴 Inactivo';
  };

  const toggleComedorStatus = (comedorId: number) => {
    const newStatus = !comedoresEstados[comedorId];
    setComedoresEstados(prev => ({
      ...prev,
      [comedorId]: newStatus
    }));
    
    // Guardar en localStorage
    localStorage.setItem(`comedor_${comedorId}_activo`, JSON.stringify(newStatus));
    
    // Notificar a otros componentes
    localStorage.setItem('comedoresUpdated', Date.now().toString());
    window.dispatchEvent(new Event('comedoresUpdated'));
  };


  if (loading) {
    return (
      <div className="map-container">
        <div className="loading">Cargando mapa de comedores...</div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div className="map-header">
        <h1>🗺️ Mapa de Comedores</h1>
        <button 
          onClick={() => {
            fetchComedores();
            fetchInventariosYServicios();
          }}
          className="refresh-btn"
          title="Actualizar comedores"
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="map-content">
        {mapView === 'map' ? (
          <div className="map-view">
            <div className="map-section">
              {(() => {
                // Filtrar solo comedores activos con coordenadas válidas
                const comedoresActivosConCoords = comedores.filter(c =>
                  c != null && c.longitud != null && c.latitud != null &&
                  !isNaN(Number(c.longitud)) && !isNaN(Number(c.latitud)) &&
                  (comedoresEstados[c.id] !== undefined ? comedoresEstados[c.id] : true) // Solo activos
                );
                
                const ubicaciones = comedoresActivosConCoords.map(c => ({
                  coordinates: [Number(c.longitud), Number(c.latitud)] as [number, number]
                }));
                const iconos = comedoresActivosConCoords.map(() => '📍');
                const nombres = comedoresActivosConCoords.map(c => c.nombre);

                console.log(`Mostrando ${comedoresActivosConCoords.length} comedores activos en el mapa`);

                return (
                  <Mapa 
                    ubicaciones={ubicaciones}
                    iconos={iconos}
                    nombres={nombres}
                    comedores={comedoresActivosConCoords}
                    onMarkerClick={setSelectedComedor}
                  />
                );
              })()}
            </div>
            <div className="comedores-sidebar">
              <h3>Comedores Cercanos</h3>
              <div className="comedores-list">
                {comedores.map((comedor) => (
                  <div 
                    key={comedor.id} 
                    className={`comedor-item ${selectedComedor?.id === comedor.id ? 'selected' : ''}`}
                    onClick={() => setSelectedComedor(comedor)}
                  >
                    <div className="comedor-header">
                      <h4>{comedor.nombre}</h4>
                      <span 
                        className="status-badge"
                        style={{ 
                          background: `linear-gradient(135deg, ${getStatusColor(comedor.id)}, ${comedoresEstados[comedor.id] ? '#764ba2' : '#ee5a52'})`,
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '15px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          boxShadow: `0 2px 8px ${getStatusColor(comedor.id)}40`,
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleComedorStatus(comedor.id)}
                        title="Hacer clic para cambiar estado"
                      >
                        {getStatusText(comedor.id)}
                      </span>
                    </div>
                    <p className="comedor-address">📍 {comedor.direccion}</p>
                    {comedor.horarios && (
                      <p className="comedor-hours">🕒 {comedor.horarios}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="list-view">
            <div className="list-header">
              <h3>Lista de Comedores</h3>
              <div className="list-filters">
                <select className="filter-select">
                  <option value="all">Todos</option>
                  <option value="active">Solo Activos</option>
                  <option value="inactive">Solo Inactivos</option>
                </select>
              </div>
            </div>
            
            <div className="comedores-grid">
              {comedores.map((comedor) => (
                <div key={comedor.id} className="comedor-card">
                  <div className="comedor-card-header">
                    <h4>{comedor.nombre}</h4>
                    <span 
                      className="status-badge"
                      style={{ 
                        background: `linear-gradient(135deg, ${getStatusColor(comedor.id)}, ${comedoresEstados[comedor.id] ? '#764ba2' : '#ee5a52'})`,
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        boxShadow: `0 2px 8px ${getStatusColor(comedor.id)}40`,
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleComedorStatus(comedor.id)}
                      title="Hacer clic para cambiar estado"
                    >
                      {getStatusText(comedor.id)}
                    </span>
                  </div>
                  
                  <div className="comedor-card-body">
                    <p className="comedor-address">📍 {comedor.direccion}</p>
                    
                    
                    {comedor.horarios && (
                      <p className="comedor-hours">🕒 {comedor.horarios}</p>
                    )}
                    
                    {(typeof comedor.latitud === 'number' && typeof comedor.longitud === 'number') && (
                      <div className="comedor-coordinates">
                        <span>📍 {comedor.latitud.toFixed(6)}, {comedor.longitud.toFixed(6)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="comedor-card-actions">
                    <button className="action-btn primary">Ver Detalles</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedComedor && (
        <div className="comedor-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{selectedComedor.nombre}</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedComedor(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="comedor-details">
                <p><strong>📍 Dirección:</strong> {selectedComedor.direccion}</p>
                <p><strong>🕒 Horarios:</strong> {selectedComedor.horarios || 'No especificado'}</p>
                <p><strong>📊 Estado:</strong> 
                  <span 
                    className="status-badge"
                    style={{ 
                      background: `linear-gradient(135deg, ${getStatusColor(selectedComedor.id)}, ${comedoresEstados[selectedComedor.id] ? '#764ba2' : '#ee5a52'})`,
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      marginLeft: '0.5rem',
                      boxShadow: `0 2px 8px ${getStatusColor(selectedComedor.id)}40`,
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleComedorStatus(selectedComedor.id)}
                    title="Hacer clic para cambiar estado"
                  >
                    {getStatusText(selectedComedor.id)}
                  </span>
                </p>
                {(typeof selectedComedor.latitud === 'number' && typeof selectedComedor.longitud === 'number') && (
                  <p><strong>🗺️ Coordenadas:</strong> {selectedComedor.latitud}, {selectedComedor.longitud}</p>
                )}
                
                {/* Inventario del comedor */}
                <div className="comedor-inventory">
                  <p><strong>📦 Inventario:</strong></p>
                  <ul>
                    {inventarios.filter(i => i.comedor_id === selectedComedor.id).map(item => (
                      <li key={item.id}>{item.nombre}: {item.cantidad} {item.unidad}</li>
                    ))}
                    {inventarios.filter(i => i.comedor_id === selectedComedor.id).length === 0 && (
                      <li>Sin inventario registrado</li>
                    )}
                  </ul>
                </div>
                
                {/* Servicios asociados al comedor */}
                <div className="comedor-services">
                  <p><strong>🧩 Servicios:</strong></p>
                  <ul>
                    {comedorServicios
                      .filter(cs => cs.comedor_id === selectedComedor.id)
                      .map(cs => servicios.find(s => s.id === cs.servicio_id))
                      .filter(Boolean)
                      .map((s: any) => (
                        <li key={s.id}>{s.nombre}</li>
                      ))}
                    {comedorServicios.filter(cs => cs.comedor_id === selectedComedor.id).length === 0 && (
                      <li>Sin servicios asociados</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;

