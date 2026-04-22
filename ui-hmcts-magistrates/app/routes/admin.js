/**
 * Legacy /admin/* routes — redirect to the staff portal.
 *
 * Kept so that pre-existing links (README, start.sh output) still work.
 */

const express = require('express');
const router = express.Router();
const store = require('../services/store');

// Redirect the old admin sign-in straight to the staff sign-in
router.get('/sign-in', (req, res) => res.redirect('/staff/sign-in'));

router.post('/sign-in', (req, res) => {
  const { userId } = req.body;
  const user = store.getStaffUser(userId);
  if (user) {
    req.session.staffUser = user;
    req.session.adminUser = user;
  }
  res.redirect('/staff/dashboard');
});

router.get('/sign-out', (req, res) => {
  delete req.session.staffUser;
  delete req.session.adminUser;
  res.redirect('/staff/sign-in');
});

// Everything else redirects to the staff equivalent
router.get('/', (req, res) => res.redirect('/staff/dashboard'));
router.get('/applications', (req, res) => res.redirect('/staff/candidates'));
router.get('/applications/:id', (req, res) => res.redirect(`/staff/candidates/${req.params.id}`));
router.get('/reports', (req, res) => res.redirect('/staff/reports'));

module.exports = router;
