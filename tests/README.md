# 🧪 Pruebas Automatizadas con Selenium

Este directorio contiene las pruebas automatizadas end-to-end para la aplicación ComeYa usando Selenium WebDriver.

## 📋 Prerequisitos

1. **Node.js** (versión 16 o superior)
2. **Chrome** instalado en el sistema
3. **Servidor frontend** ejecutándose en `http://localhost:5173`
4. **Servidor backend** ejecutándose en `http://localhost:3000`

## 🚀 Instalación

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
npm install --save-dev selenium-webdriver chromedriver
```

## 📁 Estructura de Archivos

```
tests/
├── config.js              # Configuración de las pruebas
├── base-test.js           # Clase base para todas las pruebas
├── login-test.js          # Pruebas específicas de login
├── navigation-test.js     # Pruebas de navegación
├── run-all-tests.js       # Ejecutor principal
└── README.md              # Esta documentación
```

## 🎯 Tipos de Pruebas

### Pruebas de Login (`login-test.js`)
- ✅ Login exitoso con credenciales válidas
- ❌ Login con credenciales inválidas
- 🔍 Validación de campos requeridos

### Pruebas de Navegación (`navigation-test.js`)
- 🏠 Navegación al Dashboard
- 🍽️ Navegación a Comedores
- 💰 Navegación a Donaciones
- 📦 Navegación a Inventario
- 📅 Navegación a Reservas
- 🚪 Funcionalidad de Logout

## 🏃‍♂️ Ejecutar Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar solo pruebas de login
```bash
npm run test:login
```

### Ejecutar solo pruebas de navegación
```bash
npm run test:navigation
```

### Ejecutar en modo headless (sin interfaz gráfica)
```bash
npm run test:headless
```

## ⚙️ Configuración

### Credenciales de Prueba
Edita `config.js` para cambiar las credenciales de prueba:

```javascript
testCredentials: {
  valid: {
    email: 'admin@comeya.com',
    password: '12345'
  },
  invalid: {
    email: 'test@invalid.com',
    password: 'wrongpassword'
  }
}
```

### URLs y Selectores
Puedes modificar las URLs y selectores en `config.js`:

```javascript
baseUrl: 'http://localhost:5173',
selectors: {
  login: {
    emailInput: '#email',
    passwordInput: '#password',
    submitButton: '.login-button'
  }
}
```

## 📊 Interpretación de Resultados

### ✅ Prueba Exitosa
- La funcionalidad funciona como se espera
- No hay errores en la consola

### ❌ Prueba Fallida
- La funcionalidad no funciona correctamente
- Se genera una captura de pantalla del error
- Revisa los logs para más detalles

### 📸 Capturas de Pantalla
- Se generan automáticamente cuando hay errores
- Se guardan con timestamp para facilitar el debugging

## 🔧 Solución de Problemas

### Error: "Chrome not found"
- Asegúrate de tener Chrome instalado
- Verifica que Chrome esté en el PATH del sistema

### Error: "Connection refused"
- Verifica que el servidor frontend esté ejecutándose en `http://localhost:5173`
- Verifica que el servidor backend esté ejecutándose en `http://localhost:3000`

### Error: "Element not found"
- Verifica que los selectores en `config.js` coincidan con tu HTML
- Asegúrate de que la página haya cargado completamente

### Error: "Timeout"
- Aumenta los valores de timeout en `config.js`
- Verifica la velocidad de tu conexión a internet

## 📝 Agregar Nuevas Pruebas

### 1. Crear nueva clase de prueba
```javascript
const BaseTest = require('./base-test');

class MiNuevaPrueba extends BaseTest {
  async testMiFuncionalidad() {
    // Tu código de prueba aquí
  }
}
```

### 2. Agregar al ejecutor principal
```javascript
// En run-all-tests.js
const MiNuevaPrueba = require('./mi-nueva-prueba');

// En el método runAllTests()
const miNuevaPrueba = new MiNuevaPrueba();
this.results.miNuevaPrueba = await miNuevaPrueba.runAllTests();
```

## 🎨 Mejores Prácticas

1. **Usa selectores específicos**: Prefiere IDs y clases específicas
2. **Espera elementos**: Siempre espera a que los elementos estén disponibles
3. **Maneja errores**: Incluye try-catch en todas las pruebas
4. **Toma capturas**: Usa `takeScreenshot()` para debugging
5. **Limpia recursos**: Siempre cierra el driver en `teardown()`

## 🚨 Notas Importantes

- Las pruebas requieren que tanto el frontend como el backend estén ejecutándose
- Las credenciales de prueba deben existir en tu base de datos
- Las pruebas pueden tomar varios minutos en completarse
- Asegúrate de tener una conexión estable a internet

## 📞 Soporte

Si tienes problemas con las pruebas:

1. Revisa los logs de error
2. Verifica la configuración en `config.js`
3. Asegúrate de que todos los servicios estén ejecutándose
4. Revisa las capturas de pantalla generadas

¡Happy Testing! 🎉
