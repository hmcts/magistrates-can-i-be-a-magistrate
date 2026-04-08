const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/index.njk');
});

module.exports = router;
