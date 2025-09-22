const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');

function isHeadlessRequested() {
  if (process.env.HEADLESS === '1' || process.env.HEADLESS === 'true') return true;
  return process.argv.includes('--headless');
}

async function createDriver(options = {}) {
  const { headless } = options;
  const chromeOptions = new chrome.Options();
  const runHeadless = headless ?? isHeadlessRequested();

  if (runHeadless) chromeOptions.addArguments('--headless=new');
  chromeOptions.addArguments('--window-size=1366,850');
  chromeOptions.addArguments('--disable-gpu');
  chromeOptions.addArguments('--no-sandbox');
  chromeOptions.addArguments('--disable-dev-shm-usage');
  chromeOptions.addArguments('--disable-background-networking');
  chromeOptions.addArguments('--no-first-run');
  chromeOptions.addArguments('--no-default-browser-check');
  chromeOptions.addArguments('--mute-audio');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

  await driver.manage().setTimeouts({ pageLoad: 60000, implicit: 5000, script: 30000 });
  return driver;
}

module.exports = { createDriver };
