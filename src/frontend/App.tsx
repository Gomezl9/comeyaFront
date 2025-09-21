import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ComedoresList from './pages/ComedoresList';
import ComedoresCreate from './pages/ComedoresCreate';
import Profile from './pages/Profile';
import Map from './pages/Map';
import Settings from './pages/Settings';
import './App.css';
import Registrarse from './pages/Registrarse';
import Donaciones from './pages/Donaciones';
import DonacionesAlimentos from './pages/DonacionesAlimentos';
import DonacionesDinero from './pages/DonacionesDinero';
import Reservas from './pages/Reservas';
import Inventario from './pages/Inventario';
import Servicios from './pages/servicios';



// Componente para proteger rutas que requieren autenticación
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = localStorage.getItem('user');
  return user ? <Layout>{children}</Layout> : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/comedores" 
            element={
              <ProtectedRoute>
                <ComedoresList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/login" 
            element={<Login/>} 
          />
          <Route 
            path="/Donaciones" 
            element={<Donaciones />} 
          />
          <Route 
            path="/DonacionesAlimentos" 
            element={<DonacionesAlimentos />} 
          />
          <Route 
            path="/DonacionesDinero" 
            element={<DonacionesDinero />} 
          />
          <Route 
            path="/Reservas" 
            element={<Reservas />} 
          />
          <Route 
            path="/Inventario" 
            element={<Inventario />} 
          />
          <Route 
            path="/servicios" 
            element={<Servicios />} 
          />
          <Route 
            path="/registrarse" 
            element={<Registrarse />} 
          />
          <Route 
            path="/comedores/crear" 
            element={
              <ProtectedRoute>
                <ComedoresCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mapa" 
            element={
              <ProtectedRoute>
                <Map />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/configuracion" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;