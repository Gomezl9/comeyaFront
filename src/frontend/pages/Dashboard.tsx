import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import { useAuth } from '../hooks/useAuth';

// SVG Icons as React Components for better control and styling
const IconComedores = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 4l9 5.5"/><path d="M19 13.5V21H5v-7.5L12 9l7 4.5z"/><path d="M12 21V15"/><path d="M8 21v-6a4 4 0 014-4 4 4 0 014 4v6"/></svg>
);
const IconDonaciones = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
);
const IconReservas = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const IconInventario = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);
const IconPerfil = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const IconComedor = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

interface QuickStats {
  total_comedores: number;
  comedores_activos: number;
  total_donaciones: number;
  total_reservas: number;
  donaciones_recientes: number;
  reservas_pendientes: number;
}

const Dashboard: React.FC = () => {
  const { user: authUser, isAdmin } = useAuth();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("No token found");
        }

        const response = await fetch('/api/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const statsData = await response.json();
        setStats(statsData);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        // Mantener el fallback por si la API falla por otra razón
        setStats({
          total_comedores: 0,
          comedores_activos: 0,
          total_donaciones: 0,
          total_reservas: 0,
          donaciones_recientes: 0,
          reservas_pendientes: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuickStats();
  }, []);

  const     getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>¡{getGreeting()}, {user.nombre.charAt(0).toUpperCase() + user.nombre.slice(1) || user.name || user.email}!</h1>
        <p>Resumen de tu actividad en la plataforma.</p>
      </div>

      {/* Estadísticas Rápidas */}
      {loading ? (
        <div className="stats-loading">
          <div className="loading-spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      ) : stats ? (
        <div className="quick-stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon comedores">
              <IconComedores />
            </div>
            <div className="stat-card-info">
              <p>Comedores Registrados</p>
              <span>{stats.total_comedores}</span>
              <div className="stat-card-footer">Activos: {stats.comedores_activos}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon donaciones">
              <IconDonaciones />
            </div>
            <div className="stat-card-info">
              <p>Donaciones Totales</p>
              <span>{stats.total_donaciones}</span>
              <div className="stat-card-footer">Recientes: {stats.donaciones_recientes}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon reservas">
              <IconReservas />
            </div>
            <div className="stat-card-info">
              <p>Reservas Totales</p>
              <span>{stats.total_reservas}</span>
              <div className="stat-card-footer">Pendientes: {stats.reservas_pendientes}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="stats-error">
          <p>No se pudieron cargar las estadísticas</p>
        </div>
      )}

      {/* Panel de Acciones */}
      <div className="actions-panel">
        <h2>Panel de Acciones</h2>
        <div className="actions-grid">
          {isAdmin && (
            <Link to="/comedores/crear" className="action-card">
              <IconComedor />
              <span>Nuevo Comedor</span>
              <p>Registra un nuevo espacio comunitario.</p>
            </Link>
          )}
          <Link to="/mapa" className="action-card">
            <IconComedores />
            <span>Mapa de Comedores</span>
            <p>Explora los comedores en el mapa.</p>
          </Link>
          <Link to="/DonacionesAlimentos" className="action-card">
            <IconDonaciones />
            <span>Donar Alimentos</span>
            <p>Contribuye con productos para los comedores.</p>
          </Link>
          <Link to="/DonacionesDinero" className="action-card">
            <IconDonaciones />
            <span>Donar Dinero</span>
            <p>Apoya económicamente a la red.</p>
          </Link>
          {isAdmin && (
            <Link to="/inventario" className="action-card">
              <IconInventario />
              <span>Inventario</span>
              <p>Revisa el inventario de los comedores.</p>
            </Link>
          )}
          <Link to="/Reservas" className="action-card">
            <IconReservas />
            <span>Hacer Reserva</span>
            <p>Asegura tu cupo en un comedor.</p>
          </Link>
          <Link to="/perfil" className="action-card">
            <IconPerfil />
            <span>Mi Perfil</span>
            <p>Actualiza tu información personal.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
