const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    screenshotOnRunFailure: true,
    video: false,
    defaultCommandTimeout: 10000,
    chromeWebSecurity: false,
    experimentalRunAllSpecs: true,
  },
  viewportWidth: 1280,
  viewportHeight: 720,
});