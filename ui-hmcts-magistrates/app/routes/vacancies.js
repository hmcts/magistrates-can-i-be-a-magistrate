const express = require('express');
const router = express.Router();
const store = require('../services/store');

router.get('/', (req, res) => {
  const { region, courtType } = req.query;
  const vacancies = store.getVacancies({ region, courtType });

  res.render('pages/vacancies/search.njk', {
    vacancies,
    regions: store.REGIONS.map(r => ({ value: r, text: r, selected: r === region })),
    selectedRegion: region,
    selectedCourtType: courtType,
    searched: !!(region || courtType),
  });
});

router.get('/:id', (req, res) => {
  const vacancy = store.getVacancy(req.params.id);
  if (!vacancy) return res.status(404).render('pages/errors/404.njk');
  res.render('pages/vacancies/details.njk', { vacancy });
});

module.exports = router;
