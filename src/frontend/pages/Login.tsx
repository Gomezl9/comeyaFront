
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import loginImage from '../assets/img/login.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: email, contraseña: password }), // 🔹 coincide con backend
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar el usuario logueado con todos sus datos
        if (data.user && data.user.id) {
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          localStorage.setItem('user', JSON.stringify({}));
        }
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        alert(data.message || 'Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-image">
          <div className="login-img-placeholder">
            <img src={loginImage} alt="Login" />
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-content">
          <div className="login-header">
            <h1 className="login-title">¡Bienvenido a COMEYA!</h1>
            <p>Inicia sesión para gestionar comedores comunitarios</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="email">📧 Correo Electrónico</label>
              <input
                type="email"
                id="email"
                placeholder="Ej: usuario@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">🔒 Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
              />
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Ingresando...
                </>
              ) : (
                '🚀 Iniciar Sesión'
              )}
            </button>

            <div className="register-link">
              <p>¿No tienes cuenta? <button type="button" onClick={() => navigate('/registrarse')} className="link-button">Regístrate aquí</button></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
