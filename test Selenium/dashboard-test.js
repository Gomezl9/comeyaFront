const { By, until } = require('selenium-webdriver');
const { createDriver } = require('./utils/driver');
const { BASE_URL, DEFAULT_TIMEOUT_MS } = require('./config');

module.exports = async function dashboardTest() {
  const driver = await createDriver();
  try {
    await driver.get(`${BASE_URL}/dashboard`);
    await driver.wait(until.elementLocated(By.css('h1, [data-testid="dashboard"]')), DEFAULT_TIMEOUT_MS);
    console.log('✅ Dashboard cargado correctamente!');
  } finally {
    await driver.quit();
  }
};

if (require.main === module) {
  (async () => {
    try {
      await module.exports();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
