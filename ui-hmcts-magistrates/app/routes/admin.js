const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const store = require('../services/store');

const MOCK_ADMIN_USERS = [
  { id: 'admin-1', email: 'admin@hmcts.gov.uk', name: 'Admin User', role: 'admin' },
];

// Sign in
router.get('/sign-in', (req, res) => {
  res.render('pages/admin/sign-in.njk', { mockAdminUsers: MOCK_ADMIN_USERS });
});

router.post('/sign-in', (req, res) => {
  const { userId } = req.body;
  const user = MOCK_ADMIN_USERS.find(u => u.id === userId);
  if (!user) {
    return res.render('pages/admin/sign-in.njk', {
      error: 'Please select an admin user.',
      mockAdminUsers: MOCK_ADMIN_USERS,
    });
  }
  req.session.adminUser = user;
  res.redirect('/admin');
});

router.get('/sign-out', (req, res) => {
  delete req.session.adminUser;
  res.redirect('/admin/sign-in');
});

// All below require admin auth
router.use(requireAdmin);

// Dashboard
router.get('/', (req, res) => {
  const summary = store.getReportSummary();
  res.render('pages/admin/dashboard.njk', { summary });
});

// Applications list
router.get('/applications', (req, res) => {
  const { search, status, region } = req.query;
  const applications = store.getAllApplications({ status, region, search });
  res.render('pages/admin/applications/list.njk', {
    applications,
    totalElements: applications.length,
    filters: { search, status, region },
  });
});

// Application detail
router.get('/applications/:id', (req, res) => {
  const application = store.getApplication(req.params.id);
  if (!application) return res.status(404).render('pages/errors/404.njk');
  res.render('pages/admin/applications/detail.njk', { application });
});

// Update status
router.post('/applications/:id/status', (req, res) => {
  const { status, reason } = req.body;
  store.updateStatus(req.params.id, status, reason);
  res.redirect(`/admin/applications/${req.params.id}`);
});

// Reports
router.get('/reports', (req, res) => {
  const summary = store.getReportSummary();
  res.render('pages/admin/reports/index.njk', { summary });
});

module.exports = router;
