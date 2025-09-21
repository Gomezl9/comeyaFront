import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './Donaciones.css';

interface DonacionCompleta {
  id: number;
  tipo: 'dinero' | 'inventario';
  monto?: number;
  cantidad?: string;
  descripcion: string;
  comedor: {
    id: number;
    nombre: string;
    direccion: string;
    horarios?: string;
    latitud?: number;
    longitud?: number;
    creado_por: number;
  };
  fecha: string;
  donante: string;
  usuario_id: number;
}

const Donaciones: React.FC = () => {
  const navigate = useNavigate();
  const [donacionesRecibidas, setDonacionesRecibidas] = useState<DonacionCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener usuario logueado desde localStorage
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  let currentUserId: number | undefined = undefined;
  try {
    const userObj = userStr ? JSON.parse(userStr) : null;
    if (userObj && typeof userObj.id === 'number') currentUserId = userObj.id;
  } catch (_e) {
    currentUserId = undefined;
  }

  useEffect(() => {
    const fetchDonaciones = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentUserId) {
          setDonacionesRecibidas([]);
          setError('Debes iniciar sesión para ver tus donaciones recibidas.');
          return;
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // Llamadas directas a la API
        const [donacionesDinero, donacionesInventario, comedores, inventarios] = await Promise.all([
          fetch('http://localhost:3000/api/donacionesdinero', { headers }).then(res => res.json()),
          fetch('http://localhost:3000/api/donacionesinventario', { headers }).then(res => res.json()),
          fetch('http://localhost:3000/api/comedores', { headers }).then(res => res.json()),
          fetch('http://localhost:3000/api/inventarios', { headers }).then(res => res.json())
        ]);

        // Procesar donaciones recibidas únicamente en comedores creados por el usuario actual
        const comedoresUsuario = comedores.filter((c: any) => c.creado_por === currentUserId);
        const comedoresIds = comedoresUsuario.map((c: any) => c.id);
        const donacionesRecibidasData: DonacionCompleta[] = [];

        // Donaciones de dinero recibidas
        donacionesDinero.forEach((donacion: any) => {
          if (comedoresIds.includes(donacion.comedor_id)) {
            const comedor = comedoresUsuario.find((c: any) => c.id === donacion.comedor_id);
            if (comedor) {
              donacionesRecibidasData.push({
                id: donacion.id,
                tipo: 'dinero',
                monto: donacion.monto,
                descripcion: `Donación de S/ ${donacion.monto}`,
                comedor,
                fecha: donacion.fecha,
                donante: `Usuario ${donacion.usuario_id}`,
                usuario_id: donacion.usuario_id
              });
            }
          }
        });

        // Donaciones de inventario recibidas (vinculadas a inventarios -> comedor)
        donacionesInventario.forEach((donacion: any) => {
          // Se asume que la donación de inventario tiene un campo inventario_id
          const inventario = inventarios.find((inv: any) => inv.id === donacion.inventario_id);
          const comedorIdAsociado = inventario?.comedor_id ?? inventario?.comedor?.id;
          if (comedorIdAsociado && comedoresIds.includes(comedorIdAsociado)) {
            const comedor = comedoresUsuario.find((c: any) => c.id === comedorIdAsociado);
            if (comedor) {
              donacionesRecibidasData.push({
                id: donacion.id,
                tipo: 'inventario',
                cantidad: `${donacion.cantidad} unidades`,
                descripcion: `Donación de inventario (${donacion.cantidad} unidades)`,
                comedor,
                fecha: donacion.fecha,
                donante: `Usuario ${donacion.usuario_id}`,
                usuario_id: donacion.usuario_id
              });
            }
          }
        });

        setDonacionesRecibidas(donacionesRecibidasData);
        
      } catch (error) {
        console.error('Error al cargar donaciones:', error);
        setError('Error al cargar las donaciones. Por favor, intenta de nuevo.');
        
        setDonacionesRecibidas([
          {
            id: 1,
            tipo: 'dinero',
            monto: 100000,
            descripcion: 'Donación de S/ 100,000',
            comedor: {
              id: 1,
              nombre: 'Comedor Central',
              direccion: 'Calle 123 #45-67',
              horarios: 'Lunes a Viernes 8:00-16:00',
              latitud: 4.609710,
              longitud: -74.081750,
              creado_por: 1
            },
            fecha: '2025-09-11',
            donante: 'María Gómez',
            usuario_id: 2
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDonaciones();
  }, [currentUserId]);

  return (
    <Layout>
      <div className="donaciones-container">
        <div className="donaciones-header">
          <h1>💝 Centro de Donaciones</h1>
          <p>Ayuda a los comedores comunitarios con tu generosidad</p>
        </div>

        <div className="donaciones-actions">
          <h2>¿Qué tipo de donación quieres realizar?</h2>
          <div className="donation-buttons">
            <button
              className="donation-btn alimentos-btn"
              onClick={() => navigate('/DonacionesAlimentos')}
            >
              <div className="btn-icon">🥘</div>
              <div className="btn-content">
                <h3>Donar Alimentos</h3>
                <p>Contribuye con alimentos nutritivos</p>
              </div>
            </button>
            <button
              className="donation-btn dinero-btn"
              onClick={() => navigate('/DonacionesDinero')}
            >
              <div className="btn-icon">💰</div>
              <div className="btn-content">
                <h3>Donar Dinero</h3>
                <p>Apoya económicamente a los comedores</p>
              </div>
            </button>
          </div>
        </div>

        <div className="donaciones-recientes">
          <h2>📋 Donaciones recibidas en mis comedores</h2>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="loading-donaciones">
              <div className="spinner"></div>
              <p>Cargando donaciones...</p>
            </div>
          ) : (
            <div className="donaciones-list">
              {donacionesRecibidas.length > 0 ? (
                donacionesRecibidas.map((donacion) => (
                  <div key={donacion.id} className="donacion-card">
                    <div className="donacion-icon">
                      {donacion.tipo === 'inventario' ? '🥘' : '💰'}
                    </div>
                    <div className="donacion-info">
                      <h3>{donacion.descripcion}</h3>
                      <p><strong>Comedor:</strong> {donacion.comedor.nombre}</p>
                      <p><strong>Donante:</strong> {donacion.donante}</p>
                      {donacion.comedor.horarios && (
                        <p><strong>Horarios:</strong> {donacion.comedor.horarios}</p>
                      )}
                      <p><strong>Fecha:</strong> {new Date(donacion.fecha).toLocaleDateString()}</p>
                      {donacion.tipo === 'dinero' && donacion.monto && (
                        <p><strong>Monto:</strong> S/ {donacion.monto}</p>
                      )}
                      {donacion.tipo === 'inventario' && donacion.cantidad && (
                        <p><strong>Cantidad:</strong> {donacion.cantidad}</p>
                      )}
                      <div className="donacion-badge">
                        <span className="badge-recibida">Donación recibida</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-donaciones">
                  <p>No has recibido donaciones en tus comedores aún</p>
                  <p>¡Comparte tus comedores para recibir donaciones!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Donaciones;
