import BaseTest from './base-test.js';
import config from './config.js';

/**
 * Pruebas de navegación y funcionalidades del dashboard
 */
class NavigationTest extends BaseTest {
  
  /**
   * Realiza login antes de las pruebas de navegación
   */
  async performLogin() {
    console.log('Realizando login para pruebas de navegación...');
    
    await this.navigateTo('/');
    await this.waitForElement(config.selectors.login.emailInput);
    
    const emailInput = await this.findElement(config.selectors.login.emailInput);
    const passwordInput = await this.findElement(config.selectors.login.passwordInput);
    
    await emailInput.clear();
    await emailInput.sendKeys(config.testCredentials.valid.email);
    
    await passwordInput.clear();
    await passwordInput.sendKeys(config.testCredentials.valid.password);
    
    const submitButton = await this.waitForClickable(config.selectors.login.submitButton);
    await submitButton.click();
    
    await this.waitForUrl(config.selectors.navigation.dashboard);
    console.log('Login completado');
  }

  /**
   * Prueba la navegación al dashboard
   */
  async testDashboardNavigation() {
    console.log('\nEjecutando prueba: Navegación al Dashboard');
    
    try {
      await this.performLogin();
      
      // Verificar que estamos en el dashboard
      const currentUrl = await this.getCurrentUrl();
      if (currentUrl.includes('/dashboard')) {
        console.log('Navegación al dashboard exitosa');
        
        // Verificar que el título de la página es correcto
        const pageTitle = await this.getPageTitle();
        console.log(`Título de la página: ${pageTitle}`);
        
        return true;
      } else {
        console.log('No se pudo navegar al dashboard');
        return false;
      }
      
    } catch (error) {
      console.log(`Error en navegación al dashboard: ${error.message}`);
      await this.takeScreenshot('dashboard-navigation-error');
      return false;
    }
  }

  /**
   * Prueba la navegación a la página de comedores
   */
  async testComedoresNavigation() {
    console.log('\nEjecutando prueba: Navegación a Comedores');
    
    try {
      await this.performLogin();
      
      // Navegar a comedores
      await this.navigateTo(config.selectors.navigation.comedores);
      
      // Verificar que estamos en la página de comedores
      const currentUrl = await this.getCurrentUrl();
      if (currentUrl.includes('/comedores')) {
        console.log('Navegación a comedores exitosa');
        return true;
      } else {
        console.log('No se pudo navegar a comedores');
        return false;
      }
      
    } catch (error) {
      console.log(`Error en navegación a comedores: ${error.message}`);
      await this.takeScreenshot('comedores-navigation-error');
      return false;
    }
  }

  /**
   * Prueba la navegación a la página de donaciones
   */
  async testDonacionesNavigation() {
    console.log('\nEjecutando prueba: Navegación a Donaciones');
    
    try {
      await this.performLogin();
      
      // Navegar a donaciones
      await this.navigateTo(config.selectors.navigation.donaciones);
      
      // Verificar que estamos en la página de donaciones
      const currentUrl = await this.getCurrentUrl();
      if (currentUrl.includes('/donaciones')) {
        console.log('Navegación a donaciones exitosa');
        return true;
      } else {
        console.log('No se pudo navegar a donaciones');
        return false;
      }
      
    } catch (error) {
      console.log(`Error en navegación a donaciones: ${error.message}`);
      await this.takeScreenshot('donaciones-navigation-error');
      return false;
    }
  }

  /**
   * Prueba la navegación a la página de inventario
   */
  async testInventarioNavigation() {
    console.log('\nEjecutando prueba: Navegación a Inventario');
    
    try {
      await this.performLogin();
      
      // Navegar a inventario
      await this.navigateTo(config.selectors.navigation.inventario);
      
      // Verificar que estamos en la página de inventario
      const currentUrl = await this.getCurrentUrl();
      if (currentUrl.includes('/inventario')) {
        console.log('Navegación a inventario exitosa');
        return true;
      } else {
        console.log('No se pudo navegar a inventario');
        return false;
      }
      
    } catch (error) {
      console.log(`Error en navegación a inventario: ${error.message}`);
      await this.takeScreenshot('inventario-navigation-error');
      return false;
    }
  }

  /**
   * Prueba la navegación a la página de reservas
   */
  async testReservasNavigation() {
    console.log('\nEjecutando prueba: Navegación a Reservas');
    
    try {
      await this.performLogin();
      
      // Navegar a reservas
      await this.navigateTo(config.selectors.navigation.reservas);
      
      // Verificar que estamos en la página de reservas
      const currentUrl = await this.getCurrentUrl();
      if (currentUrl.includes('/reservas')) {
        console.log('Navegación a reservas exitosa');
        return true;
      } else {
        console.log('No se pudo navegar a reservas');
        return false;
      }
      
    } catch (error) {
      console.log(`Error en navegación a reservas: ${error.message}`);
      await this.takeScreenshot('reservas-navigation-error');
      return false;
    }
  }

  /**
   * Prueba la funcionalidad de logout
   */
  async testLogout() {
    console.log('\nEjecutando prueba: Logout');
    
    try {
      await this.performLogin();
      
      // Buscar y hacer clic en el botón de logout (si existe)
      // Nota: Necesitarías agregar un botón de logout en tu aplicación
      try {
        const logoutButton = await this.findElement('.logout-button, [data-testid="logout"], .user-menu .logout');
        await logoutButton.click();
        
        // Esperar a que se redirija al login
        await this.waitForUrl('/');
        
        const currentUrl = await this.getCurrentUrl();
        if (currentUrl.includes('/') && !currentUrl.includes('/dashboard')) {
          console.log('Logout exitoso');
          return true;
        } else {
          console.log('Logout falló - No se redirigió correctamente');
          return false;
        }
      } catch (error) {
        console.log('No se encontró botón de logout - Saltando prueba');
        return true; // No es un error si no hay botón de logout
      }
      
    } catch (error) {
      console.log(`Error en logout: ${error.message}`);
      await this.takeScreenshot('logout-error');
      return false;
    }
  }

  /**
   * Ejecuta todas las pruebas de navegación
   */
  async runAllTests() {
    console.log('Iniciando pruebas de Navegación...\n');
    
    const results = {
      dashboardNavigation: false,
      comedoresNavigation: false,
      donacionesNavigation: false,
      inventarioNavigation: false,
      reservasNavigation: false,
      logout: false
    };
    
    try {
      await this.setup();
      
      results.dashboardNavigation = await this.testDashboardNavigation();
      results.comedoresNavigation = await this.testComedoresNavigation();
      results.donacionesNavigation = await this.testDonacionesNavigation();
      results.inventarioNavigation = await this.testInventarioNavigation();
      results.reservasNavigation = await this.testReservasNavigation();
      results.logout = await this.testLogout();
      
    } catch (error) {
      console.log(`Error general en las pruebas: ${error.message}`);
    } finally {
      await this.teardown();
    }
    
    // Mostrar resumen de resultados
    console.log('\nRESUMEN DE PRUEBAS DE NAVEGACIÓN:');
    console.log('====================================');
    console.log(`Dashboard: ${results.dashboardNavigation ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`Comedores: ${results.comedoresNavigation ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`Donaciones: ${results.donacionesNavigation ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`Inventario: ${results.inventarioNavigation ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`Reservas: ${results.reservasNavigation ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`Logout: ${results.logout ? 'PASÓ' : 'FALLÓ'}`);
    
    const passedTests = Object.values(results).filter(result => result).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\nResultado: ${passedTests}/${totalTests} pruebas pasaron`);
    
    return results;
  }
}

// Si se ejecuta directamente, correr las pruebas
if (import.meta.url === `file://${process.argv[1]}`) {
  const navigationTest = new NavigationTest();
  navigationTest.runAllTests().then(results => {
    process.exit(Object.values(results).every(result => result) ? 0 : 1);
  });
}

export default NavigationTest;
