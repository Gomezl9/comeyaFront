// Configuración para las pruebas de Selenium
export default {
  // URL base de la aplicación
  baseUrl: 'http://localhost:5173',
  
  // Configuración del navegador
  browser: 'chrome',
  
  // Rutas específicas para Windows (si no están en PATH)
  browserPaths: {
    chrome: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    edge: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  },
  
  // Timeouts
  timeout: {
    implicit: 10000,    // 10 segundos
    explicit: 15000,    // 15 segundos
    pageLoad: 30000     // 30 segundos
  },
  
  // Credenciales de prueba
  testCredentials: {
    valid: {
      email: 'admin@comeya.com',
      password: '12345'
    },
    invalid: {
      email: 'test@invalid.com',
      password: 'wrongpassword'
    }
  },
  
  // Selectores de elementos (basados en el Login.tsx)
  selectors: {
    login: {
      emailInput: '#email',
      passwordInput: '#password',
      submitButton: '.login-button',
      errorMessage: '.error-message'
    },
    navigation: {
      dashboard: '/dashboard',
      comedores: '/comedores',
      donaciones: '/donaciones',
      inventario: '/inventario',
      reservas: '/reservas'
    }
  }
};
