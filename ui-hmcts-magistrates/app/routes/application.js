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
  const { getFolder } = require('../services/folders');
  res.render('pages/application/my-applications.njk', { applications, getFolder });
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

// ----- Post-submission applicant pages (must be declared BEFORE /:id/:stepName) -----

// Status page — a timeline of where the application is in the pipeline
router.get('/:id/status', (req, res) => {
  const application = store.getApplication(req.params.id);
  if (!application) return res.status(404).render('pages/errors/404.njk');
  const { folderList, getFolder } = require('../services/folders');
  res.render('pages/application/status.njk', {
    application,
    currentFolder: getFolder(application.currentFolder),
    folderList,
    getFolder,
  });
});

// References form
router.get('/:id/references', (req, res) => {
  const application = store.getApplication(req.params.id);
  if (!application) return res.status(404).render('pages/errors/404.njk');
  res.render('pages/application/references.njk', { application });
});

router.post('/:id/references', (req, res) => {
  const { referee1Name, referee1Email, referee2Name, referee2Email } = req.body;
  store.updateStageData(req.params.id, 'references', {
    referee1: { name: referee1Name, email: referee1Email, status: 'pending' },
    referee2: { name: referee2Name, email: referee2Email, status: 'pending' },
    requestedAt: new Date().toISOString(),
    receivedAt: null,
  });
  res.redirect(`/application/${req.params.id}/status`);
});

// Interview booking
router.get('/:id/interview/book', (req, res) => {
  const application = store.getApplication(req.params.id);
  if (!application) return res.status(404).render('pages/errors/404.njk');
  const slots = store.getInterviewSlotsForVacancy(application.vacancyId, { availableOnly: true });
  res.render('pages/application/interview-book.njk', { application, slots });
});

router.post('/:id/interview/book', (req, res) => {
  const { slotId } = req.body;
  const slot = store.bookInterviewSlot(slotId, req.params.id);
  if (!slot) return res.redirect(`/application/${req.params.id}/interview/book`);
  store.updateStageData(req.params.id, 'interview', {
    slotId,
    bookedAt: new Date().toISOString(),
    panel: slot.panel,
    teamsLink: slot.teamsLink,
    score: null,
    outcome: 'pending',
  });
  res.redirect(`/application/${req.params.id}/interview/confirmation`);
});

router.get('/:id/interview/confirmation', (req, res) => {
  const application = store.getApplication(req.params.id);
  if (!application) return res.status(404).render('pages/errors/404.njk');
  const slot = application.interview && application.interview.slotId
    ? store.getInterviewSlot(application.interview.slotId)
    : null;
  res.render('pages/application/interview-confirmation.njk', { application, slot });
});

// DBS upload (offline cert) — mock file upload: captured as filename string
router.get('/:id/dbs/upload', (req, res) => {
  const application = store.getApplication(req.params.id);
  if (!application) return res.status(404).render('pages/errors/404.njk');
  res.render('pages/application/dbs-upload.njk', { application });
});

router.post('/:id/dbs/upload', (req, res) => {
  const { certFilename } = req.body;
  store.updateStageData(req.params.id, 'dbs', {
    certUploadedAt: new Date().toISOString(),
    certFilename: certFilename || 'dbs-certificate.pdf',
    checkOutcome: 'clear',
  });
  res.redirect(`/application/${req.params.id}/status`);
});

// Appeal
router.get('/:id/appeal', (req, res) => {
  const application = store.getApplication(req.params.id);
  if (!application) return res.status(404).render('pages/errors/404.njk');
  res.render('pages/application/appeal.njk', { application });
});

router.post('/:id/appeal', (req, res) => {
  const { grounds, requestSpjReview } = req.body;
  store.updateStageData(req.params.id, 'appeal', {
    stage: requestSpjReview ? 'spj_review' : 'ac_review',
    lodgedAt: new Date().toISOString(),
    grounds,
    outcome: null,
  });
  // Move folder into appeal if they were rejected / not appointed
  const app = store.getApplication(req.params.id);
  if (app && (app.currentFolder === 'rejected' || app.currentFolder === 'not_appointed')) {
    store.moveFolder(req.params.id, 'appeal', { by: 'applicant', reason: 'Appeal lodged' });
  }
  res.redirect(`/application/${req.params.id}/status`);
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
