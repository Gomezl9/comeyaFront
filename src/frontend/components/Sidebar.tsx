import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../hooks/useAuth';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  // Definición base de los items del menú
  const allMenuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Home', exact: true, admin: false },
    // El enlace a comedores es condicional
    isAdmin
      ? { path: '/comedores', icon: '🍽️', label: 'Comedores', exact: false, admin: true }
      : { path: '/mapa', icon: '🗺️', label: 'Mapa Comedores', exact: true, admin: false },
    { path: '/inventario', icon: '📦', label: 'Inventario', exact: true, admin: true },
    { path: '/servicios', icon: '🛠️', label: 'Servicios', exact: true, admin: false },
    { path: '/donaciones', icon: '🎁', label: 'Donaciones', exact: true, admin: false },
    { path: '/reservas', icon: '📅', label: 'Reservas', exact: true, admin: false },
    { path: '/perfil', icon: '👤', label: 'Mi Perfil', exact: true, admin: false },
    { path: '/configuracion', icon: '⚙️', label: 'Configuración', exact: true, admin: false },
  ];

  // Filtrar items del menú basados en el rol del usuario
  const menuItems = allMenuItems.filter(item => !item.admin || (item.admin && isAdmin));

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

