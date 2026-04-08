const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const store = require('../services/store');

const STEPS = [
  { name: 'personal-information', label: 'Personal information' },
  { name: 'preliminary-questions', label: 'Preliminary questions' },
  { name: 'eligibility-questions', label: 'Eligibility questions' },
  { name: 'employment-questions', label: 'Employment questions' },
  { name: 'character-questions', label: 'Character questions' },
  { name: 'additional-information', label: 'Additional information' },
  { name: 'diversity-monitoring', label: 'Diversity monitoring questions' },
  { name: 'declaration', label: 'Declaration' },
];

router.use(requireAuth);

// My applications
router.get('/my-applications', (req, res) => {
  const applications = store.getMyApplications(req.session.user.id);
  res.render('pages/application/my-applications.njk', { applications });
});

// Start new application
router.get('/start', (req, res) => {
  const { vacancyId } = req.query;
  if (!vacancyId) return res.redirect('/vacancies');

  const application = store.createApplication(vacancyId, req.session.user.id);
  if (!application) return res.redirect('/vacancies');
  res.redirect(`/application/${application.id}`);
});

// Task list
router.get('/:id', (req, res) => {
  const application = store.getApplication(req.params.id);
  if (!application) return res.status(404).render('pages/errors/404.njk');

  const steps = STEPS.map(step => {
    const saved = application.steps[step.name];
    return {
      ...step,
      isComplete: saved ? saved.isComplete : false,
      hasData: saved ? Object.keys(saved.formData || {}).length > 0 : false,
    };
  });
  const completedCount = steps.filter(s => s.isComplete).length;
  const allComplete = completedCount === steps.length;

  res.render('pages/application/task-list.njk', {
    application,
    steps,
    completedCount,
    allComplete,
  });
});

// Check answers
router.get('/:id/check-answers', (req, res) => {
  const application = store.getApplication(req.params.id);
  if (!application) return res.status(404).render('pages/errors/404.njk');
  res.render('pages/application/check-answers.njk', { application, steps: STEPS });
});

// Submit
router.post('/:id/submit', (req, res) => {
  store.submitApplication(req.params.id);
  res.redirect(`/application/${req.params.id}/confirmation`);
});

// Confirmation
router.get('/:id/confirmation', (req, res) => {
  const application = store.getApplication(req.params.id);
  if (!application) return res.status(404).render('pages/errors/404.njk');
  res.render('pages/application/confirmation.njk', { application });
});

// Step GET
router.get('/:id/:stepName', (req, res) => {
  const { id, stepName } = req.params;
  const step = STEPS.find(s => s.name === stepName);
  if (!step) return res.status(404).render('pages/errors/404.njk');

  const saved = store.getStep(id, stepName);
  res.render(`pages/application/steps/${stepName}.njk`, {
    applicationId: id,
    stepName,
    stepLabel: step.label,
    formData: saved ? saved.formData : {},
    errors: {},
  });
});

// Step POST
router.post('/:id/:stepName', (req, res) => {
  const { id, stepName } = req.params;
  const step = STEPS.find(s => s.name === stepName);
  if (!step) return res.status(404).render('pages/errors/404.njk');

  const formData = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (key !== '_csrf' && key !== 'action') {
      formData[key] = value;
    }
  }

  store.saveStep(id, stepName, formData);

  if (req.body.action === 'save-and-return') {
    res.redirect('/application/my-applications');
  } else {
    res.redirect(`/application/${id}`);
  }
});

module.exports = router;
