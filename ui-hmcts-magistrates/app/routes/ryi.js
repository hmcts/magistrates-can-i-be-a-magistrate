const express = require('express');
const router = express.Router();
const store = require('../services/store');

router.get('/register-your-interest', (req, res) => {
  res.render('pages/ryi/form.njk', { regions: store.REGIONS });
});

router.post('/register-your-interest', (req, res) => {
  const { firstName, lastName, email, region, courtType } = req.body;
  if (!firstName || !lastName || !email) {
    return res.render('pages/ryi/form.njk', {
      regions: store.REGIONS,
      values: req.body,
      error: 'Please complete all required fields.',
    });
  }
  const registrant = store.createRyiRegistrant({ firstName, lastName, email, region, courtType });
  res.render('pages/ryi/confirmation.njk', { registrant });
});

module.exports = router;
