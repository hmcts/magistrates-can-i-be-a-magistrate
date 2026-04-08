const express = require('express');
const router = express.Router();

const MOCK_USERS = [
  { id: '11111111-1111-1111-1111-111111111111', email: 'applicant@example.com', firstName: 'Jane', lastName: 'Smith', role: 'applicant' },
  { id: '22222222-2222-2222-2222-222222222222', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: 'applicant' },
];

router.get('/sign-in', (req, res) => {
  const returnTo = req.query.returnTo || '/';
  res.render('pages/auth/sign-in.njk', { returnTo, mockUsers: MOCK_USERS });
});

router.post('/sign-in', (req, res) => {
  const { userId, returnTo } = req.body;
  const user = MOCK_USERS.find(u => u.id === userId);

  if (!user) {
    return res.render('pages/auth/sign-in.njk', {
      error: 'Please select a user to sign in.',
      mockUsers: MOCK_USERS,
      returnTo,
    });
  }

  req.session.user = user;
  res.redirect(returnTo || '/');
});

router.get('/sign-out', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
