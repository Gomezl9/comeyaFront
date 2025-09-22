import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './Donaciones.css';
import { useAuth } from '../hooks/useAuth';

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
  const { user, isAdmin } = useAuth();
  const [donacionesRecibidas, setDonacionesRecibidas] = useState<DonacionCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonaciones = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!user) {
          setDonacionesRecibidas([]);
          setError('Debes iniciar sesión para ver tus donaciones recibidas.');
          return;
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        // Llamadas a la API
        const fetchInventarios = isAdmin 
          ? fetch('http://localhost:3000/api/inventarios', { headers }).then(res => res.ok ? res.json() : [])
          : Promise.resolve([]);

        const [donacionesDinero, donacionesInventario, comedores, inventarios] = await Promise.all([
          fetch('http://localhost:3000/api/donacionesdinero', { headers }).then(res => res.json()),
          fetch('http://localhost:3000/api/donacionesinventario', { headers }).then(res => res.json()),
          fetch('http://localhost:3000/api/comedores', { headers }).then(res => res.json()),
          fetchInventarios
        ]);

        let donacionesMostradas: DonacionCompleta[] = [];

        if (isAdmin) {
          // Lógica para Admin: Mostrar donaciones recibidas en sus comedores
          const comedoresUsuario = comedores.filter((c: any) => c.creado_por === user?.id);
          const comedoresIds = comedoresUsuario.map((c: any) => c.id);

          donacionesDinero.forEach((donacion: any) => {
            if (comedoresIds.includes(donacion.comedor_id)) {
              const comedor = comedoresUsuario.find((c: any) => c.id === donacion.comedor_id);
              if (comedor) donacionesMostradas.push({ ...donacion, tipo: 'dinero', comedor, descripcion: `Donación de S/ ${donacion.monto}` });
            }
          });

          if (Array.isArray(inventarios)) {
            donacionesInventario.forEach((donacion: any) => {
              const inventario = inventarios.find((inv: any) => inv.id === donacion.inventario_id);
              const comedorIdAsociado = inventario?.comedor_id;
              if (comedorIdAsociado && comedoresIds.includes(comedorIdAsociado)) {
                const comedor = comedoresUsuario.find((c: any) => c.id === comedorIdAsociado);
                if (comedor) donacionesMostradas.push({ ...donacion, tipo: 'inventario', comedor, descripcion: `Donación de inventario (${donacion.cantidad} unidades)` });
              }
            });
          }
        } else {
          // Lógica para Usuario: Mostrar donaciones realizadas por él
          const donacionesDineroUsuario = donacionesDinero.filter((d: any) => d.usuario_id === user?.id);
          donacionesDineroUsuario.forEach((donacion: any) => {
            const comedor = comedores.find((c: any) => c.id === donacion.comedor_id);
            if (comedor) donacionesMostradas.push({ ...donacion, tipo: 'dinero', comedor, descripcion: `Donación de S/ ${donacion.monto}` });
          });

          const donacionesInventarioUsuario = donacionesInventario.filter((d: any) => d.usuario_id === user?.id);
          donacionesInventarioUsuario.forEach((donacion: any) => {
            // Para usuarios, no podemos saber el comedor de la donación de inventario sin acceso a la API de inventario.
            // Mostraremos la donación con un comedor genérico.
            const comedorGenerico = { id: 0, nombre: 'Comedor no especificado', direccion: '' };
            donacionesMostradas.push({ ...donacion, tipo: 'inventario', comedor: comedorGenerico, descripcion: `Donación de inventario (${donacion.cantidad} unidades)` });
          });
        }
        
        setDonacionesRecibidas(donacionesMostradas);
        
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
  }, [user, isAdmin]);

  return (
    <Layout>
      <div className="donaciones-container">
        <div className="donaciones-header">
          <h1>Centro de Donaciones</h1>
          <p>Ayuda a los comedores comunitarios con tu generosidad</p>
        </div>

        <div className="donaciones-actions">
          <h2>¿Qué tipo de donación quieres realizar?</h2>
          <div className="donation-buttons">
            <button
              className="donation-btn alimentos-btn"
              onClick={() => navigate('/DonacionesAlimentos')}
            >
              <div className="btn-content">
                <h3>Donar Alimentos</h3>
                <p>Contribuye con alimentos nutritivos</p>
              </div>
            </button>
            <button
              className="donation-btn dinero-btn"
              onClick={() => navigate('/DonacionesDinero')}
            >
              <div className="btn-content">
                <h3>Donar Dinero</h3>
                <p>Apoya económicamente a los comedores</p>
              </div>
            </button>
          </div>
        </div>

        <div className="donaciones-recientes">
          <h2>
            {isAdmin 
              ? 'Donaciones recibidas en mis comedores' 
              : 'Mis Donaciones Realizadas'}
          </h2>

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
                  <div key={`${donacion.tipo}-${donacion.id}`} className="donacion-card">
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
                        <span className="badge-recibida">
                          {isAdmin ? 'Donación recibida' : 'Donación realizada'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-donaciones">
                  <p>
                    {isAdmin
                      ? 'No has recibido donaciones en tus comedores aún'
                      : 'Aún no has realizado ninguna donación'}
                  </p>
                  <p>
                    {isAdmin
                      ? '¡Comparte tus comedores para recibir donaciones!'
                      : '¡Anímate a donar y ayuda a un comedor!'}
                  </p>
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
