import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const menuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home', exact: true },
    { path: '/comedores', icon: '🍽️', label: 'Comedores', exact: false },
    { path: '/mapa', icon: '🗺️', label: 'Mapa', exact: true },
    { path: '/inventario', icon: '📦', label: 'Inventario', exact: true },
    { path: '/servicios', icon: '🛠️', label: 'Servicios', exact: true },
    { path: '/donaciones', icon: '🎁', label: 'Donaciones', exact: true },
    { path: '/reservas', icon: '📅', label: 'Reservas', exact: true },
    { path: '/perfil', icon: '👤', label: 'Mi Perfil', exact: true },
    { path: '/configuracion', icon: '⚙️', label: 'Configuración', exact: true },
  ];

  const isActive = (path: string, exact: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>COMEYA!</h2>
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <span className="user-name" title={user.email || 'Usuario'}>
            {user.nombre || user.email || 'Usuario'}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={() => {
            localStorage.removeItem('user');
            window.location.href = '/';
          }}
          className="logout-btn"
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

