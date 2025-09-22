import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../hooks/useAuth';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  // Definición base de los items del menú
  const allMenuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home', exact: true, adminOnly: false },
    { path: '/comedores', icon: '🍽️', label: 'Gestionar Comedores', exact: false, adminOnly: true },
    { path: '/mapa', icon: '🗺️', label: 'Mapa de Comedores', exact: true, adminOnly: false },
    { path: '/inventario', icon: '📦', label: 'Inventario', exact: true, adminOnly: true },
    { path: '/servicios', icon: '🛠️', label: 'Servicios', exact: true, adminOnly: false },
    { path: '/donaciones', icon: '🎁', label: 'Donaciones', exact: true, adminOnly: false },
    { path: '/reservas', icon: '📅', label: 'Reservas', exact: true, adminOnly: false },
    { path: '/perfil', icon: '👤', label: 'Mi Perfil', exact: true, adminOnly: false },
    { path: '/configuracion', icon: '⚙️', label: 'Configuración', exact: true, adminOnly: false },
  ];

  // Filtrar items del menú basados en el rol del usuario
  const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin);

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
          <span className="user-name" title={user?.correo || 'Usuario'}>
            {user?.nombre || user?.correo || 'Usuario'}
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
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

