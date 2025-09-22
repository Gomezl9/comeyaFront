const { By, until } = require('selenium-webdriver');
const { createDriver } = require('./utils/driver');
const { BASE_URL, DEFAULT_TIMEOUT_MS } = require('./config');

module.exports = async function registrarseTest() {
  const driver = await createDriver();
  try {
    await driver.get(`${BASE_URL}/registrarse`);
    await driver.wait(until.elementLocated(By.css('form, [data-testid="registrarse"]')), DEFAULT_TIMEOUT_MS);
  } finally {
    await driver.quit();
  }
};


