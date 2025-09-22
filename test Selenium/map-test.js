const { By, until } = require('selenium-webdriver');
const { createDriver } = require('./utils/driver');
const { BASE_URL, DEFAULT_TIMEOUT_MS } = require('./config');

module.exports = async function mapTest() {
  const driver = await createDriver();
  const TIMEOUT = Math.max(DEFAULT_TIMEOUT_MS, 30000);
  try {
    await driver.get('about:blank');
    await driver.get(`${BASE_URL}/map`);
    await driver.wait(until.urlContains('/map'), TIMEOUT);
    await driver.wait(
      until.elementLocated(
        By.css('#map, [data-testid="map"], canvas.mapboxgl-canvas, div.mapboxgl-canvas-container, canvas')
      ),
      TIMEOUT
    );
  } finally {
    await driver.quit();
  }
};


