const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'UP', service: 'ui-hmcts-magistrates' });
});

module.exports = router;
