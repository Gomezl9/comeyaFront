import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import config from './config.js';

/**
 * Clase base para todas las pruebas de Selenium
 */
class BaseTest {
  constructor() {
    this.driver = null;
    this.config = config;
  }

  /**
   * Configura el driver antes de cada prueba
   */
  async setup() {
    console.log('Configurando el driver de Selenium...');
    
    // Opciones de Chrome
    const options = new chrome.Options();
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    
    // Configurar ruta específica de Chrome si está disponible
    if (this.config.browserPaths && this.config.browserPaths.chrome) {
      options.setChromeBinaryPath(this.config.browserPaths.chrome);
      console.log(`Usando Chrome desde: ${this.config.browserPaths.chrome}`);
    }
    
    // Crear el driver
    this.driver = await new Builder()
      .forBrowser(this.config.browser)
      .setChromeOptions(options)
      .build();
    
    // Configurar timeouts
    await this.driver.manage().setTimeouts({
      implicit: this.config.timeout.implicit,
      pageLoad: this.config.timeout.pageLoad
    });
    
    console.log('Driver configurado correctamente');
  }

  /**
   * Limpia el driver después de cada prueba
   */
  async teardown() {
    if (this.driver) {
      console.log('Cerrando el driver...');
      await this.driver.quit();
      this.driver = null;
      console.log('Driver cerrado correctamente');
    }
  }

  /**
   * Navega a una URL específica
   */
  async navigateTo(url) {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseUrl}${url}`;
    console.log(`Navegando a: ${fullUrl}`);
    await this.driver.get(fullUrl);
  }

  /**
   * Espera a que un elemento sea visible
   */
  async waitForElement(selector, timeout = this.config.timeout.explicit) {
    console.log(`Esperando elemento: ${selector}`);
    return await this.driver.wait(
      until.elementLocated(By.css(selector)),
      timeout
    );
  }

  /**
   * Espera a que un elemento sea clickeable
   */
  async waitForClickable(selector, timeout = this.config.timeout.explicit) {
    console.log(`Esperando elemento clickeable: ${selector}`);
    const element = await this.waitForElement(selector, timeout);
    return await this.driver.wait(
      until.elementIsEnabled(element),
      timeout
    );
  }

  /**
   * Espera a que la URL contenga un texto específico
   */
  async waitForUrl(urlPart, timeout = this.config.timeout.explicit) {
    console.log(`Esperando URL que contenga: ${urlPart}`);
    return await this.driver.wait(
      until.urlContains(urlPart),
      timeout
    );
  }

  /**
   * Encuentra un elemento por selector
   */
  async findElement(selector) {
    return await this.driver.findElement(By.css(selector));
  }

  /**
   * Encuentra múltiples elementos por selector
   */
  async findElements(selector) {
    return await this.driver.findElements(By.css(selector));
  }

  /**
   * Toma una captura de pantalla
   */
  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${name}-${timestamp}.png`;
    const screenshot = await this.driver.takeScreenshot();
    
    // En un entorno real, guardarías la imagen
    console.log(`Captura de pantalla: ${filename}`);
    return screenshot;
  }

  /**
   * Ejecuta JavaScript en el navegador
   */
  async executeScript(script, ...args) {
    return await this.driver.executeScript(script, ...args);
  }

  /**
   * Obtiene el título de la página
   */
  async getPageTitle() {
    return await this.driver.getTitle();
  }

  /**
   * Obtiene la URL actual
   */
  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }
}

export default BaseTest;
