import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

interface QuickStats {
  total_comedores: number;
  comedores_activos: number;
  total_donaciones: number;
  total_reservas: number;
  donaciones_recientes: number;
  reservas_pendientes: number;
}

const Dashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        // Intentar obtener estadísticas del backend
        const [comedoresRes, donacionesDineroRes, donacionesInventarioRes, reservasRes] = await Promise.all([
          fetch('/api/comedores'),
          fetch('/api/donacionesdinero'),
          fetch('/api/donacionesinventario'),
          fetch('/api/reservas')
        ]);

        const comedoresData = await comedoresRes.json();
        const donacionesDineroData = await donacionesDineroRes.json();
        const donacionesInventarioData = await donacionesInventarioRes.json();
        const reservasData = await reservasRes.json();

        // Combinar datos de donaciones
        const donacionesCombinadas = [
          ...(Array.isArray(donacionesDineroData) ? donacionesDineroData : []),
          ...(Array.isArray(donacionesInventarioData) ? donacionesInventarioData : [])
        ];

        setStats({
          total_comedores: Array.isArray(comedoresData) ? comedoresData.length : 0,
          comedores_activos: Array.isArray(comedoresData) ? comedoresData.filter((c: any) => c.activo).length : 0,
          total_donaciones: donacionesCombinadas.length,
          total_reservas: Array.isArray(reservasData) ? reservasData.length : 0,
          donaciones_recientes: donacionesCombinadas.filter((d: any) => {
            const fecha = new Date(d.fecha);
            const hoy = new Date();
            const diffTime = Math.abs(hoy.getTime() - fecha.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
          }).length,
          reservas_pendientes: Array.isArray(reservasData) ? reservasData.filter((r: any) => r.estado === 'pendiente').length : 0
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        // Fallback con datos de ejemplo
        setStats({
          total_comedores: 8,
          comedores_activos: 7,
          total_donaciones: 15,
          total_reservas: 23,
          donaciones_recientes: 3,
          reservas_pendientes: 5
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuickStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1>🏠 ¡{getGreeting()}, {user.nombre || user.name || user.email}! 👋</h1>
          <p>Tu centro de control para gestionar comedores comunitarios</p>
          <div className="welcome-time">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        <div className="welcome-illustration">
          <div className="floating-icons">
            <div className="icon-1">🍽️</div>
            <div className="icon-2">💝</div>
            <div className="icon-3">📅</div>
            <div className="icon-4">🗺️</div>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="quick-stats-section">
        <h2>📊 Resumen del Sistema</h2>
        {loading ? (
          <div className="stats-loading">
            <div className="loading-spinner"></div>
            <p>Cargando estadísticas...</p>
          </div>
        ) : stats ? (
          <div className="quick-stats-grid">
            <div className="stat-item">
              <div className="stat-icon">🍽️</div>
              <div className="stat-content">
                <h3>{stats.total_comedores}</h3>
                <p>Comedores Registrados</p>
                <span className="stat-subtitle">{stats.comedores_activos} activos</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">💝</div>
              <div className="stat-content">
                <h3>{stats.total_donaciones}</h3>
                <p>Donaciones Totales</p>
                <span className="stat-subtitle">{stats.donaciones_recientes} esta semana</span>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>{stats.total_reservas}</h3>
                <p>Reservas Totales</p>
                <span className="stat-subtitle">{stats.reservas_pendientes} pendientes</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="stats-error">
            <p>No se pudieron cargar las estadísticas</p>
          </div>
        )}
      </div>

      {/* Servicios Principales */}
      <div className="services-section">
        <h2>🚀 Servicios Principales</h2>
        <div className="dashboard-cards">
          <Link to="/comedores" className="dashboard-card primary">
            <div className="card-icon">🍽️</div>
            <h3>Gestionar Comedores</h3>
            <p>Ver, editar y administrar comedores comunitarios</p>
            <div className="card-stats">
              <span>{stats?.total_comedores || 0} comedores</span>
            </div>
            <span className="card-arrow">→</span>
          </Link>

          <Link to="/comedores/crear" className="dashboard-card success">
            <div className="card-icon">➕</div>
            <h3>Crear Comedor</h3>
            <p>Registrar un nuevo comedor comunitario</p>
            <div className="card-stats">
              <span>Nuevo registro</span>
            </div>
            <span className="card-arrow">→</span>
          </Link>

          <Link to="/mapa" className="dashboard-card info">
            <div className="card-icon">🗺️</div>
            <h3>Ver en Mapa</h3>
            <p>Explorar comedores en el mapa interactivo</p>
            <div className="card-stats">
              <span>Ubicaciones</span>
            </div>
            <span className="card-arrow">→</span>
          </Link>
        </div>
      </div>

      {/* Servicios de Donaciones y Reservas */}
      <div className="services-section">
        <h2>💝 Servicios de Comunidad</h2>
        <div className="dashboard-cards">
          <Link to="/Donaciones" className="dashboard-card donation">
            <div className="card-icon">💝</div>
            <h3>Centro de Donaciones</h3>
            <p>Gestionar donaciones de alimentos y dinero</p>
            <div className="card-stats">
              <span>{stats?.total_donaciones || 0} donaciones</span>
              <span className="recent">{stats?.donaciones_recientes || 0} recientes</span>
            </div>
            <span className="card-arrow">→</span>
          </Link>

          <Link to="/DonacionesAlimentos" className="dashboard-card food">
            <div className="card-icon">🥘</div>
            <h3>Donar Alimentos</h3>
            <p>Registrar donación de alimentos nutritivos</p>
            <div className="card-stats">
              <span>Alimentos</span>
            </div>
            <span className="card-arrow">→</span>
          </Link>

          <Link to="/DonacionesDinero" className="dashboard-card money">
            <div className="card-icon">💰</div>
            <h3>Donar Dinero</h3>
            <p>Contribuir económicamente a los comedores</p>
            <div className="card-stats">
              <span>Económico</span>
            </div>
            <span className="card-arrow">→</span>
          </Link>

          <Link to="/Reservas" className="dashboard-card reservation">
            <div className="card-icon">📅</div>
            <h3>Sistema de Reservas</h3>
            <p>Gestionar reservas de comedores</p>
            <div className="card-stats">
              <span>{stats?.total_reservas || 0} reservas</span>
              <span className="pending">{stats?.reservas_pendientes || 0} pendientes</span>
            </div>
            <span className="card-arrow">→</span>
          </Link>
        </div>
      </div>

      {/* Administración */}
      <div className="services-section">
        <h2>⚙️ Administración</h2>
        <div className="dashboard-cards">
          <Link to="/usuarios" className="dashboard-card admin">
            <div className="card-icon">👥</div>
            <h3>Gestionar Usuarios</h3>
            <p>Administrar usuarios del sistema</p>
            <div className="card-stats">
              <span>Usuarios</span>
            </div>
            <span className="card-arrow">→</span>
          </Link>

          <Link to="/perfil" className="dashboard-card profile">
            <div className="card-icon">👤</div>
            <h3>Mi Perfil</h3>
            <p>Configurar perfil personal</p>
            <div className="card-stats">
              <span>Personal</span>
            </div>
            <span className="card-arrow">→</span>
          </Link>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="quick-actions">
        <h2>⚡ Acciones Rápidas</h2>
        <div className="quick-actions-grid">
          <Link to="/comedores/crear" className="quick-action">
            <div className="action-icon">➕</div>
            <span>Nuevo Comedor</span>
          </Link>
          <Link to="/DonacionesAlimentos" className="quick-action">
            <div className="action-icon">🥘</div>
            <span>Donar Alimentos</span>
          </Link>
          <Link to="/DonacionesDinero" className="quick-action">
            <div className="action-icon">💰</div>
            <span>Donar Dinero</span>
          </Link>
          <Link to="/Reservas" className="quick-action">
            <div className="action-icon">📅</div>
            <span>Hacer Reserva</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
