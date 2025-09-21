import LoginTest from './login-test.js';
import NavigationTest from './navigation-test.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Ejecutor principal de todas las pruebas de Selenium
 */
class TestRunner {
  constructor() {
    this.results = {
      login: {},
      navigation: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        startTime: null,
        endTime: null,
        duration: 0
      }
    };
  }

  /**
   * Verifica si hay navegadores disponibles
   */
  async checkBrowsers() {
    console.log('Verificando navegadores disponibles...\n');
    
    const browsers = [
      { name: 'Chrome', command: 'chrome --version' },
      { name: 'Edge', command: 'msedge --version' },
      { name: 'Firefox', command: 'firefox --version' }
    ];
    
    const availableBrowsers = [];
    
    for (const browser of browsers) {
      try {
        const { stdout } = await execAsync(browser.command);
        console.log(`✓ ${browser.name} encontrado: ${stdout.trim()}`);
        availableBrowsers.push(browser);
      } catch (error) {
        console.log(`✗ ${browser.name} no encontrado`);
      }
    }
    
    if (availableBrowsers.length === 0) {
      console.log('\n❌ PROBLEMA: No se encontraron navegadores compatibles');
      console.log('\nSOLUCIÓN:');
      console.log('1. Instala Google Chrome desde: https://www.google.com/chrome/');
      console.log('2. O instala Microsoft Edge desde: https://www.microsoft.com/edge');
      console.log('3. Reinicia tu terminal después de la instalación');
      console.log('4. Vuelve a ejecutar: npm test');
      return false;
    }
    
    console.log(`\n✓ Navegadores disponibles: ${availableBrowsers.map(b => b.name).join(', ')}`);
    return true;
  }

  /**
   * Ejecuta todas las pruebas
   */
  async runAllTests() {
    console.log('INICIANDO SUITE COMPLETA DE PRUEBAS SELENIUM');
    console.log('================================================\n');
    
    // Verificar navegadores primero
    const browsersAvailable = await this.checkBrowsers();
    if (!browsersAvailable) {
      console.log('\nPruebas canceladas - Instala un navegador primero');
      return false;
    }
    
    console.log('\nIniciando pruebas...\n');
    this.results.summary.startTime = new Date();
    
    try {
      // Ejecutar pruebas de login
      console.log('FASE 1: PRUEBAS DE LOGIN');
      console.log('============================');
      const loginTest = new LoginTest();
      this.results.login = await loginTest.runAllTests();
      
      console.log('\nFASE 2: PRUEBAS DE NAVEGACIÓN');
      console.log('==================================');
      const navigationTest = new NavigationTest();
      this.results.navigation = await navigationTest.runAllTests();
      
    } catch (error) {
      console.log(`Error crítico en la ejecución de pruebas: ${error.message}`);
    } finally {
      this.results.summary.endTime = new Date();
      this.results.summary.duration = this.results.summary.endTime - this.results.summary.startTime;
      
      this.generateSummary();
    }
  }

  /**
   * Genera el resumen final de todas las pruebas
   */
  generateSummary() {
    console.log('\nRESUMEN FINAL DE TODAS LAS PRUEBAS');
    console.log('=====================================');
    
    // Contar pruebas de login
    const loginTests = Object.values(this.results.login);
    const loginPassed = loginTests.filter(result => result).length;
    const loginTotal = loginTests.length;
    
    // Contar pruebas de navegación
    const navigationTests = Object.values(this.results.navigation);
    const navigationPassed = navigationTests.filter(result => result).length;
    const navigationTotal = navigationTests.length;
    
    // Totales
    this.results.summary.totalTests = loginTotal + navigationTotal;
    this.results.summary.passedTests = loginPassed + navigationPassed;
    this.results.summary.failedTests = this.results.summary.totalTests - this.results.summary.passedTests;
    
    console.log(`\nESTADÍSTICAS:`);
    console.log(`   Total de pruebas: ${this.results.summary.totalTests}`);
    console.log(`   Pruebas exitosas: ${this.results.summary.passedTests}`);
    console.log(`   Pruebas fallidas: ${this.results.summary.failedTests}`);
    console.log(`   Tasa de éxito: ${((this.results.summary.passedTests / this.results.summary.totalTests) * 100).toFixed(1)}%`);
    console.log(`   Tiempo total: ${(this.results.summary.duration / 1000).toFixed(2)} segundos`);
    
    console.log(`\nPRUEBAS DE LOGIN:`);
    console.log(`   Login exitoso: ${this.results.login.successfulLogin ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`   Login inválido: ${this.results.login.invalidLogin ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`   Validación campos: ${this.results.login.requiredFieldsValidation ? 'PASÓ' : 'FALLÓ'}`);
    
    console.log(`\nPRUEBAS DE NAVEGACIÓN:`);
    console.log(`   Dashboard: ${this.results.navigation.dashboardNavigation ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`   Comedores: ${this.results.navigation.comedoresNavigation ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`   Donaciones: ${this.results.navigation.donacionesNavigation ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`   Inventario: ${this.results.navigation.inventarioNavigation ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`   Reservas: ${this.results.navigation.reservasNavigation ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`   Logout: ${this.results.navigation.logout ? 'PASÓ' : 'FALLÓ'}`);
    
    // Resultado final
    const allTestsPassed = this.results.summary.failedTests === 0;
    
    console.log(`\nRESULTADO FINAL:`);
    if (allTestsPassed) {
      console.log('   TODAS LAS PRUEBAS PASARON!');
      console.log('   Tu aplicación está funcionando correctamente.');
    } else {
      console.log('   ALGUNAS PRUEBAS FALLARON');
      console.log('   Revisa los errores anteriores y corrige los problemas.');
    }
    
    console.log('\nNOTAS:');
    console.log('   - Asegúrate de que el servidor frontend esté ejecutándose en http://localhost:5173');
    console.log('   - Asegúrate de que el servidor backend esté ejecutándose en http://localhost:3000');
    console.log('   - Las credenciales de prueba están configuradas en tests/config.js');
    console.log('   - Las capturas de pantalla se guardan automáticamente en caso de errores');
    
    return allTestsPassed;
  }

  /**
   * Ejecuta solo las pruebas de login
   */
  async runLoginTests() {
    console.log('EJECUTANDO SOLO PRUEBAS DE LOGIN');
    console.log('===================================\n');
    
    const loginTest = new LoginTest();
    this.results.login = await loginTest.runAllTests();
    
    return this.results.login;
  }

  /**
   * Ejecuta solo las pruebas de navegación
   */
  async runNavigationTests() {
    console.log('EJECUTANDO SOLO PRUEBAS DE NAVEGACIÓN');
    console.log('========================================\n');
    
    const navigationTest = new NavigationTest();
    this.results.navigation = await navigationTest.runAllTests();
    
    return this.results.navigation;
  }
}

// Si se ejecuta directamente, correr todas las pruebas
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.endsWith(process.argv[1]);

if (isMainModule) {
  console.log('Ejecutando suite completa de pruebas Selenium...');
  const testRunner = new TestRunner();
  
  // Verificar argumentos de línea de comandos
  const args = process.argv.slice(2);
  const testType = args[0];
  
  testRunner.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default TestRunner;
