/**
 * Staff-facing routes (/staff/*).
 *
 * Covers all internal roles (AC Support, Advisory Committee, JO HR, SPJ Office,
 * HMCTS HQ). The prototype signs any staff user into the same session slot —
 * per-role authorisation is enforced at the route level where it matters.
 */

const express = require('express');
const router = express.Router();
const { requireStaff } = require('../middleware/auth');
const store = require('../services/store');
const { folderList, getFolder, getNextFolders } = require('../services/folders');

// ----- Sign-in / sign-out -----

router.get('/sign-in', (req, res) => {
  const staffUsers = store.getAllStaffUsers();
  const returnTo = req.query.returnTo || '/staff/dashboard';
  res.render('pages/staff/sign-in.njk', { staffUsers, returnTo });
});

router.post('/sign-in', (req, res) => {
  const { userId, returnTo } = req.body;
  const user = store.getStaffUser(userId);
  if (!user) {
    return res.render('pages/staff/sign-in.njk', {
      error: 'Please select a staff user.',
      staffUsers: store.getAllStaffUsers(),
      returnTo: returnTo || '/staff/dashboard',
    });
  }
  req.session.staffUser = user;
  req.session.adminUser = user; // Keep legacy /admin routes happy
  res.redirect(returnTo || '/staff/dashboard');
});

router.get('/sign-out', (req, res) => {
  delete req.session.staffUser;
  delete req.session.adminUser;
  res.redirect('/staff/sign-in');
});

// All routes below require staff auth
router.use(requireStaff);

// Expose staff user + service name to templates under /staff
router.use((req, res, next) => {
  res.locals.staffUser = req.staffUser;
  res.locals.serviceName = 'Magistrates recruitment — staff portal';
  next();
});

// ----- Dashboard -----

router.get('/dashboard', (req, res) => {
  const summary = store.getReportSummary();
  const byFolderTiles = folderList.map(f => ({
    folder: f,
    count: summary.byFolder[f.key] || 0,
  }));
  res.render('pages/staff/dashboard.njk', { summary, byFolderTiles });
});

// ----- Candidates list -----

router.get('/candidates', (req, res) => {
  const { folder, region, vacancyId, q: search } = req.query;
  const candidates = store.getAllApplications({ folder, region, vacancyId, search });
  res.render('pages/staff/candidates/list.njk', {
    candidates,
    folders: folderList,
    vacancies: store.getAllVacancies(),
    regions: store.REGIONS,
    filters: { folder, region, vacancyId, search },
    getFolder,
  });
});

// ----- Candidate detail -----

router.get('/candidates/:id', (req, res) => {
  const candidate = store.getApplication(req.params.id);
  if (!candidate) return res.status(404).render('pages/errors/404.njk');
  const currentFolder = getFolder(candidate.currentFolder);
  const nextFolders = getNextFolders(candidate.currentFolder);
  res.render('pages/staff/candidates/detail.njk', {
    candidate,
    currentFolder,
    nextFolders,
    vacancy: store.getVacancy(candidate.vacancyId),
    getFolder,
  });
});

// ----- Move folder -----

router.post('/candidates/:id/move', (req, res) => {
  const { toFolder, reason } = req.body;
  const result = store.moveFolder(req.params.id, toFolder, {
    by: `${req.staffUser.firstName} ${req.staffUser.lastName} (${req.staffUser.roleName})`,
    reason: reason || `Moved to ${getFolder(toFolder) ? getFolder(toFolder).name : toFolder}`,
  });
  if (!result.ok) {
    const candidate = store.getApplication(req.params.id);
    return res.status(400).render('pages/staff/candidates/detail.njk', {
      candidate,
      currentFolder: getFolder(candidate.currentFolder),
      nextFolders: getNextFolders(candidate.currentFolder),
      vacancy: store.getVacancy(candidate.vacancyId),
      getFolder,
      error: result.error === 'invalid-transition'
        ? `Cannot move from ${result.from} to ${result.to}.`
        : `Move failed: ${result.error}.`,
    });
  }
  res.redirect(`/staff/candidates/${req.params.id}`);
});

// ----- Add comment -----

router.post('/candidates/:id/comment', (req, res) => {
  const { text } = req.body;
  if (text && text.trim()) {
    store.addComment(
      req.params.id,
      `${req.staffUser.firstName} ${req.staffUser.lastName} (${req.staffUser.roleName})`,
      text.trim(),
    );
  }
  res.redirect(`/staff/candidates/${req.params.id}`);
});

// ----- Per-stage actions (thin stubs — capture decisions and record in audit) -----

router.post('/candidates/:id/eligibility', (req, res) => {
  const { outcome, notes } = req.body;
  store.updateStageData(req.params.id, 'eligibility', {
    reviewedBy: `${req.staffUser.firstName} ${req.staffUser.lastName}`,
    outcome,
    notes,
    reviewedAt: new Date().toISOString(),
  });
  store.addComment(req.params.id,
    `${req.staffUser.firstName} ${req.staffUser.lastName} (${req.staffUser.roleName})`,
    `Eligibility review: ${outcome}. ${notes || ''}`.trim());
  res.redirect(`/staff/candidates/${req.params.id}`);
});

router.post('/candidates/:id/sjt-outcome', (req, res) => {
  const { outcome, score } = req.body;
  store.updateStageData(req.params.id, 'sjt', {
    completedAt: new Date().toISOString(),
    score: score ? Number(score) : null,
    outcome,
  });
  res.redirect(`/staff/candidates/${req.params.id}`);
});

router.post('/candidates/:id/interview-outcome', (req, res) => {
  const { outcome, score } = req.body;
  store.updateStageData(req.params.id, 'interview', {
    score: score ? Number(score) : null,
    outcome,
  });
  res.redirect(`/staff/candidates/${req.params.id}`);
});

router.post('/candidates/:id/recommendation', (req, res) => {
  const { decision, appendixInfo } = req.body;
  store.updateStageData(req.params.id, 'recommendation', {
    decision,
    appendixInfo,
    decidedAt: new Date().toISOString(),
  });
  res.redirect(`/staff/candidates/${req.params.id}`);
});

router.post('/candidates/:id/jo-decision', (req, res) => {
  const { spjDecision, appointmentLetterUrl } = req.body;
  store.updateStageData(req.params.id, 'jo', {
    spjDecision,
    appointedAt: spjDecision === 'appoint' ? new Date().toISOString() : null,
    appointmentLetterUrl: appointmentLetterUrl || null,
  });
  res.redirect(`/staff/candidates/${req.params.id}`);
});

// ----- Vacancies -----

router.get('/vacancies', (req, res) => {
  res.render('pages/staff/vacancies/list.njk', { vacancies: store.getAllVacancies() });
});

router.get('/vacancies/new', (req, res) => {
  res.render('pages/staff/vacancies/new.njk', { regions: store.REGIONS });
});

router.post('/vacancies/new', (req, res) => {
  const vac = store.createVacancy({
    title: req.body.title,
    description: req.body.description,
    advisoryCommittee: req.body.advisoryCommittee,
    region: req.body.region,
    courtType: req.body.courtType,
    opensAt: req.body.opensAt,
    closesAt: req.body.closesAt,
    positionsAvailable: Number(req.body.positionsAvailable) || 10,
  });
  res.redirect(`/staff/vacancies/${vac.id}`);
});

router.get('/vacancies/:id', (req, res) => {
  const vacancy = store.getVacancy(req.params.id);
  if (!vacancy) return res.status(404).render('pages/errors/404.njk');
  const slots = store.getInterviewSlotsForVacancy(vacancy.id);
  res.render('pages/staff/vacancies/detail.njk', { vacancy, slots });
});

router.post('/vacancies/:id/update', (req, res) => {
  store.updateVacancy(req.params.id, {
    status: req.body.status,
    closesAt: req.body.closesAt,
  });
  res.redirect(`/staff/vacancies/${req.params.id}`);
});

// ----- Interview slots -----

router.post('/vacancies/:id/slots', (req, res) => {
  const vacancy = store.getVacancy(req.params.id);
  if (!vacancy) return res.status(404).render('pages/errors/404.njk');
  store.createInterviewSlot({
    vacancyId: vacancy.id,
    vacancyTitle: vacancy.title,
    start: req.body.start,
    end: req.body.end,
    panel: (req.body.panel || '').split(',').map(s => s.trim()).filter(Boolean),
  });
  res.redirect(`/staff/vacancies/${vacancy.id}`);
});

// ----- Appeals queue -----

router.get('/appeals', (req, res) => {
  const appeals = store.getAllApplications({ folder: 'appeal' });
  res.render('pages/staff/appeals/list.njk', { appeals });
});

router.post('/candidates/:id/appeal-decision', (req, res) => {
  const { outcome, stage } = req.body;
  store.updateStageData(req.params.id, 'appeal', {
    stage: stage || 'completed',
    outcome,
    decidedAt: new Date().toISOString(),
  });
  if (outcome === 'granted') {
    store.moveFolder(req.params.id, 'appointed', {
      by: `${req.staffUser.firstName} ${req.staffUser.lastName}`,
      reason: 'Appeal granted',
    });
  }
  res.redirect(`/staff/candidates/${req.params.id}`);
});

// ----- RYI -----

router.get('/ryi', (req, res) => {
  res.render('pages/staff/ryi/list.njk', { registrants: store.getAllRyiRegistrants() });
});

router.post('/ryi/:id/invite', (req, res) => {
  store.inviteRyiRegistrant(req.params.id);
  res.redirect('/staff/ryi');
});

// ----- Reports -----

router.get('/reports', (req, res) => {
  const summary = store.getReportSummary();
  res.render('pages/staff/reports/index.njk', { summary, folders: folderList, getFolder });
});

module.exports = router;
