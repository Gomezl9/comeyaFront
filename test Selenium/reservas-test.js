const { By, until } = require('selenium-webdriver');
const { createDriver } = require('./utils/driver');
const { BASE_URL, DEFAULT_TIMEOUT_MS } = require('./config');

module.exports = async function reservasTest() {
  const driver = await createDriver();
  try {
    await driver.get(`${BASE_URL}/reservas`);
    await driver.wait(until.elementLocated(By.css('[data-testid=\"reservas\"], h1')), DEFAULT_TIMEOUT_MS);
  } finally {
    await driver.quit();
  }
};


