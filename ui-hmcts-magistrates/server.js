const express = require('express');
const nunjucks = require('nunjucks');
const path = require('path');
const session = require('express-session');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions (in-memory)
app.use(session({
  secret: process.env.SESSION_SECRET || 'magistrates-prototype-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1800000,
  },
}));
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Render terminates TLS at a proxy
}

// Static assets
app.use('/assets', express.static(path.join(__dirname, 'node_modules/govuk-frontend/dist/govuk/assets')));
app.use('/govuk-frontend', express.static(path.join(__dirname, 'node_modules/govuk-frontend/dist/govuk')));
app.use('/public', express.static(path.join(__dirname, 'app/assets')));

// Nunjucks
const nunjucksEnv = nunjucks.configure([
  path.join(__dirname, 'app/views'),
  path.join(__dirname, 'node_modules/govuk-frontend/dist'),
], {
  autoescape: true,
  express: app,
  noCache: true,
});

nunjucksEnv.addFilter('date', (str) => {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
});

// Make session available in templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.serviceName = 'Apply to be a magistrate';
  next();
});

// Routes
app.use('/', require('./app/routes/index'));
app.use('/', require('./app/routes/ryi'));
app.use('/vacancies', require('./app/routes/vacancies'));
app.use('/auth', require('./app/routes/auth'));
app.use('/application', require('./app/routes/application'));
app.use('/admin', require('./app/routes/admin'));
app.use('/staff', require('./app/routes/staff'));
app.use('/guide', require('./app/routes/guide'));
app.use('/health', require('./app/routes/health'));

// 404
app.use((req, res) => {
  res.status(404).render('pages/errors/404.njk');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/errors/500.njk');
});

app.listen(PORT, () => {
  console.log(`\n  Magistrates UI running on http://localhost:${PORT}\n`);
});

module.exports = app;
