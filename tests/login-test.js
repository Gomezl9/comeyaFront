import BaseTest from './base-test.js';
import config from './config.js';

/**
 * Pruebas específicas para el login
 */
class LoginTest extends BaseTest {
  
  /**
   * Prueba de login exitoso
   */
  async testSuccessfulLogin() {
    console.log('\nEjecutando prueba: Login exitoso');
    
    try {
      // Navegar a la página de login
      await this.navigateTo('/');
      
      // Esperar a que la página cargue completamente
      await this.waitForElement(config.selectors.login.emailInput);
      
      // Llenar el formulario de login
      console.log('Llenando formulario de login...');
      const emailInput = await this.findElement(config.selectors.login.emailInput);
      const passwordInput = await this.findElement(config.selectors.login.passwordInput);
      
      await emailInput.clear();
      await emailInput.sendKeys(config.testCredentials.valid.email);
      
      await passwordInput.clear();
      await passwordInput.sendKeys(config.testCredentials.valid.password);
      
      // Hacer clic en el botón de login
      console.log('Enviando formulario...');
      const submitButton = await this.waitForClickable(config.selectors.login.submitButton);
      await submitButton.click();
      
      // Esperar a que se redirija al dashboard
      await this.waitForUrl(config.selectors.navigation.dashboard);
      
      // Verificar que estamos en el dashboard
      const currentUrl = await this.getCurrentUrl();
      if (currentUrl.includes('/dashboard')) {
        console.log('Login exitoso - Redirigido al dashboard');
        return true;
      } else {
        console.log('Login falló - No se redirigió al dashboard');
        return false;
      }
      
    } catch (error) {
      console.log(`Error en login exitoso: ${error.message}`);
      await this.takeScreenshot('login-error');
      return false;
    }
  }

  /**
   * Prueba de login con credenciales inválidas
   */
  async testInvalidLogin() {
    console.log('\nEjecutando prueba: Login con credenciales inválidas');
    
    try {
      // Navegar a la página de login
      await this.navigateTo('/');
      
      // Esperar a que la página cargue completamente
      await this.waitForElement(config.selectors.login.emailInput);
      
      // Llenar el formulario con credenciales inválidas
      console.log('Llenando formulario con credenciales inválidas...');
      const emailInput = await this.findElement(config.selectors.login.emailInput);
      const passwordInput = await this.findElement(config.selectors.login.passwordInput);
      
      await emailInput.clear();
      await emailInput.sendKeys(config.testCredentials.invalid.email);
      
      await passwordInput.clear();
      await passwordInput.sendKeys(config.testCredentials.invalid.password);
      
      // Hacer clic en el botón de login
      console.log('Enviando formulario...');
      const submitButton = await this.waitForClickable(config.selectors.login.submitButton);
      await submitButton.click();
      
      // Esperar un poco para que aparezca el mensaje de error
      await this.driver.sleep(2000);
      
      // Verificar que no se redirigió (debería quedarse en la página de login)
      const currentUrl = await this.getCurrentUrl();
      if (!currentUrl.includes('/dashboard')) {
        console.log('Login con credenciales inválidas manejado correctamente');
        return true;
      } else {
        console.log('Login con credenciales inválidas falló - Se redirigió incorrectamente');
        return false;
      }
      
    } catch (error) {
      console.log(`Error en login inválido: ${error.message}`);
      await this.takeScreenshot('invalid-login-error');
      return false;
    }
  }

  /**
   * Prueba de validación de campos requeridos
   */
  async testRequiredFieldsValidation() {
    console.log('\nEjecutando prueba: Validación de campos requeridos');
    
    try {
      // Navegar a la página de login
      await this.navigateTo('/');
      
      // Esperar a que la página cargue completamente
      await this.waitForElement(config.selectors.login.emailInput);
      
      // Intentar enviar el formulario vacío
      console.log('Intentando enviar formulario vacío...');
      const submitButton = await this.waitForClickable(config.selectors.login.submitButton);
      await submitButton.click();
      
      // Verificar que el navegador muestra validación HTML5
      const emailInput = await this.findElement(config.selectors.login.emailInput);
      const isEmailValid = await emailInput.getAttribute('validity');
      
      // En HTML5, si el campo es requerido y está vacío, validity.valid será false
      const emailValidity = await this.driver.executeScript(
        'return arguments[0].validity.valid;', 
        emailInput
      );
      
      if (!emailValidity) {
        console.log('Validación de campos requeridos funciona correctamente');
        return true;
      } else {
        console.log('Validación de campos requeridos falló');
        return false;
      }
      
    } catch (error) {
      console.log(`Error en validación de campos: ${error.message}`);
      await this.takeScreenshot('validation-error');
      return false;
    }
  }

  /**
   * Ejecuta todas las pruebas de login
   */
  async runAllTests() {
    console.log('Iniciando pruebas de Login...\n');
    
    const results = {
      successfulLogin: false,
      invalidLogin: false,
      requiredFieldsValidation: false
    };
    
    try {
      await this.setup();
      
      results.successfulLogin = await this.testSuccessfulLogin();
      results.invalidLogin = await this.testInvalidLogin();
      results.requiredFieldsValidation = await this.testRequiredFieldsValidation();
      
    } catch (error) {
      console.log(`Error general en las pruebas: ${error.message}`);
    } finally {
      await this.teardown();
    }
    
    // Mostrar resumen de resultados
    console.log('\nRESUMEN DE PRUEBAS DE LOGIN:');
    console.log('================================');
    console.log(`Login exitoso: ${results.successfulLogin ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`Login inválido: ${results.invalidLogin ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`Validación campos: ${results.requiredFieldsValidation ? 'PASÓ' : 'FALLÓ'}`);
    
    const passedTests = Object.values(results).filter(result => result).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\nResultado: ${passedTests}/${totalTests} pruebas pasaron`);
    
    return results;
  }
}

// Si se ejecuta directamente, correr las pruebas
if (import.meta.url === `file://${process.argv[1]}`) {
  const loginTest = new LoginTest();
  loginTest.runAllTests().then(results => {
    process.exit(Object.values(results).every(result => result) ? 0 : 1);
  });
}

export default LoginTest;
