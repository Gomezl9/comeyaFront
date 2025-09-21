# Guía Rápida - Pruebas Selenium

## Inicio Rápido

### 1. Instalar dependencias (ya hecho)
```bash
npm install --save-dev selenium-webdriver chromedriver
```

### 2. Verificar configuración completa
```bash
npm run test:final
```

### 3. Ejecutar ejemplo básico
```bash
npm run test:example
```

### 4. Ejecutar todas las pruebas
```bash
npm test
```

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run test:final` | **PRINCIPAL** - Verificación completa |
| `npm run test:simple` | Verificación rápida |
| `npm run test:check` | Verificar navegadores disponibles |
| `npm run test:setup` | Verificar configuración de Selenium |
| `npm run test:example` | Ejemplo básico de Selenium |
| `npm run test:login` | Solo pruebas de login |
| `npm run test:navigation` | Solo pruebas de navegación |
| `npm test` | Todas las pruebas |
| `npm run test:headless` | Pruebas sin interfaz gráfica |

## Configuración Rápida

### Antes de ejecutar las pruebas:
1. **Frontend**: `npm run dev` (puerto 5173)
2. **Backend**: Ejecutar tu servidor backend (puerto 3000)

### Credenciales de prueba (en `tests/config.js`):
- **Email**: `admin@comeya.com`
- **Contraseña**: `12345`

## Archivos Importantes

- `tests/config.js` - Configuración de pruebas
- `tests/example-test.js` - Ejemplo básico
- `tests/login-test.js` - Pruebas de login
- `tests/navigation-test.js` - Pruebas de navegación
- `tests/run-all-tests.js` - Ejecutor principal

## Solución de Problemas

### Error: "Chrome not found"
- Instala Google Chrome
- Verifica que esté en el PATH

### Error: "Connection refused"
- Verifica que el servidor esté ejecutándose
- Revisa los puertos (5173 para frontend, 3000 para backend)

### Error: "Element not found"
- La página no ha cargado completamente
- Verifica los selectores en `config.js`

## Interpretación de Resultados

- **PASÓ** - La prueba fue exitosa
- **FALLÓ** - La prueba falló (revisa los logs)
- **ADVERTENCIA** - Información adicional

## ¡Listo!

Ya tienes Selenium configurado y listo para usar. Comienza con `npm run test:example` para verificar que todo funciona.

Para más detalles, consulta `tests/README.md`.
