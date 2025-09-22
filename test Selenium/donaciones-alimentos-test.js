const { By, until } = require('selenium-webdriver');
const { createDriver } = require('./utils/driver');
const { BASE_URL, DEFAULT_TIMEOUT_MS } = require('./config');

module.exports = async function donacionesAlimentosTest() {
  const driver = await createDriver();
  const TIMEOUT = Math.max(DEFAULT_TIMEOUT_MS, 30000);
  try {
    await driver.get('about:blank');
    await driver.get(`${BASE_URL}/donaciones/alimentos`);
    await driver.wait(until.urlContains('/donaciones'), TIMEOUT);
    await driver.wait(
      until.elementLocated(
        By.css('[data-testid="donaciones-alimentos"], h1, h2, main')
      ),
      TIMEOUT
    );
  } finally {
    await driver.quit();
  }
};


