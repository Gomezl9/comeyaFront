import React, { useState } from 'react';
import './Settings.css';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false
    },
    privacy: {
      profilePublic: true,
      showEmail: false,
      showPhone: false
    },
    system: {
      language: 'es',
      theme: 'light',
      timezone: 'America/Lima'
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      loginAlerts: true
    }
  });

  const [activeTab, setActiveTab] = useState('notifications');

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleSave = () => {
    // Aquí guardarías las configuraciones en el backend
    alert('Configuraciones guardadas exitosamente');
  };

  const tabs = [
    { id: 'notifications', label: '🔔 Notificaciones', icon: '🔔' },
    { id: 'privacy', label: '🔒 Privacidad', icon: '🔒' },
    { id: 'system', label: '⚙️ Sistema', icon: '⚙️' },
    { id: 'security', label: '🛡️ Seguridad', icon: '🛡️' }
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Configuración del Sistema</h1>
        <p>Personaliza tu experiencia en COMEYA!</p>
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="settings-main">
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>🔔 Configuración de Notificaciones</h2>
              <p>Elige cómo quieres recibir notificaciones sobre comedores y actividades.</p>
              
              <div className="settings-group">
                <h3>Tipos de Notificación</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Notificaciones por Email</h4>
                    <p>Recibe actualizaciones importantes por correo electrónico</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Notificaciones Push</h4>
                    <p>Recibe notificaciones en tiempo real en tu dispositivo</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications.push}
                      onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Notificaciones SMS</h4>
                    <p>Recibe alertas críticas por mensaje de texto</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications.sms}
                      onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>🔒 Configuración de Privacidad</h2>
              <p>Controla qué información es visible para otros usuarios.</p>
              
              <div className="settings-group">
                <h3>Visibilidad del Perfil</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Perfil Público</h4>
                    <p>Permite que otros usuarios vean tu perfil básico</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.privacy.profilePublic}
                      onChange={(e) => handleSettingChange('privacy', 'profilePublic', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Mostrar Email</h4>
                    <p>Permite que otros usuarios vean tu dirección de email</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.privacy.showEmail}
                      onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Mostrar Teléfono</h4>
                    <p>Permite que otros usuarios vean tu número de teléfono</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.privacy.showPhone}
                      onChange={(e) => handleSettingChange('privacy', 'showPhone', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="settings-section">
              <h2>⚙️ Configuración del Sistema</h2>
              <p>Personaliza la apariencia y comportamiento de la aplicación.</p>
              
              <div className="settings-group">
                <h3>Preferencias Generales</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Idioma</h4>
                    <p>Selecciona el idioma de la interfaz</p>
                  </div>
                  <select
                    value={settings.system.language}
                    onChange={(e) => handleSettingChange('system', 'language', e.target.value)}
                    className="setting-select"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Tema</h4>
                    <p>Elige entre tema claro u oscuro</p>
                  </div>
                  <select
                    value={settings.system.theme}
                    onChange={(e) => handleSettingChange('system', 'theme', e.target.value)}
                    className="setting-select"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Zona Horaria</h4>
                    <p>Configura tu zona horaria local</p>
                  </div>
                  <select
                    value={settings.system.timezone}
                    onChange={(e) => handleSettingChange('system', 'timezone', e.target.value)}
                    className="setting-select"
                  >
                    <option value="America/Lima">Lima (GMT-5)</option>
                    <option value="America/New_York">Nueva York (GMT-5)</option>
                    <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                    <option value="Europe/Madrid">Madrid (GMT+1)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>🛡️ Configuración de Seguridad</h2>
              <p>Protege tu cuenta con configuraciones de seguridad avanzadas.</p>
              
              <div className="settings-group">
                <h3>Autenticación</h3>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Autenticación de Dos Factores</h4>
                    <p>Añade una capa extra de seguridad a tu cuenta</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactor}
                      onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Alertas de Inicio de Sesión</h4>
                    <p>Recibe notificaciones cuando alguien inicie sesión en tu cuenta</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.security.loginAlerts}
                      onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Tiempo de Expiración de Sesión</h4>
                    <p>Configura cuánto tiempo permanece activa tu sesión</p>
                  </div>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="setting-select"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={120}>2 horas</option>
                    <option value={480}>8 horas</option>
                  </select>
                </div>
              </div>

              <div className="settings-group">
                <h3>Acciones de Seguridad</h3>
                
                <div className="security-actions">
                  <button className="security-btn primary">
                    🔑 Cambiar Contraseña
                  </button>
                  <button className="security-btn secondary">
                    📱 Configurar 2FA
                  </button>
                  <button className="security-btn warning">
                    🚪 Cerrar Todas las Sesiones
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="settings-footer">
            <button onClick={handleSave} className="save-settings-btn">
              💾 Guardar Configuraciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

