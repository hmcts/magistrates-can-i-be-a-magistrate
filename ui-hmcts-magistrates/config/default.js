module.exports = {
  port: process.env.PORT || 3000,
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4550',
  sessionSecret: process.env.SESSION_SECRET || 'magistrates-dev-secret',
};
