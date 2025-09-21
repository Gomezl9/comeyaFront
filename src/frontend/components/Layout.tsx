import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar />
      
      <div className="main-content">
        <header className="main-header">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>COMEYA! - Sistema de Comedores Comunitarios</h1>
        </header>
        
        <main className="main-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

