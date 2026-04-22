/**
 * In-memory data store for the prototype.
 *
 * All data comes from `./seed.js`. This module exposes read/write helpers used
 * by the routes. Resets when the server restarts.
 *
 * The store uses a folder-based lifecycle (see `./folders.js`). Legacy
 * `status` is preserved on each application for compatibility with existing
 * admin templates — it mirrors a coarse view of `currentFolder`.
 */

const crypto = require('crypto');
const seed = require('./seed.js');
const { getFolder, canMoveTo } = require('./folders.js');

const uuid = () => crypto.randomUUID();

// Mutable collections — references kept so routes can read the latest state.
const advisoryCommittees = seed.advisoryCommittees;
const vacancies = seed.vacancies;
const applicants = seed.applicants;
const staffUsers = seed.staffUsers;
const ryiRegistrants = [...seed.ryiRegistrants];
const applications = [...seed.applications];
const interviewSlots = [...seed.interviewSlots];

let appSeq = applications.length + 1;

// ----- Vacancies -----

function getVacancies({ region, courtType, includeAll = false } = {}) {
  return vacancies.filter(v => {
    if (region && v.region !== region) return false;
    if (courtType && v.courtType !== courtType) return false;
    if (!includeAll && v.status !== 'open') return false;
    return true;
  });
}

function getAllVacancies() {
  return vacancies;
}

function getVacancy(id) {
  return vacancies.find(v => v.id === id);
}

function createVacancy(input) {
  const v = {
    id: `vac-${uuid()}`,
    reference: input.reference || `MAG-2026-${String(vacancies.length + 1).padStart(5, '0')}`,
    title: input.title,
    description: input.description || '',
    advisoryCommittee: input.advisoryCommittee,
    advisoryCommitteeId: input.advisoryCommitteeId || null,
    courtType: input.courtType,
    region: input.region,
    opensAt: input.opensAt,
    closesAt: input.closesAt,
    status: input.status || 'open',
    positionsAvailable: input.positionsAvailable || 10,
  };
  vacancies.push(v);
  return v;
}

function updateVacancy(id, patch) {
  const v = getVacancy(id);
  if (!v) return null;
  Object.assign(v, patch);
  return v;
}

// ----- Applicants + Staff -----

function getApplicant(id) {
  return applicants.find(a => a.id === id);
}

function getStaffUser(id) {
  return staffUsers.find(u => u.id === id);
}

function getAllApplicants() {
  return applicants;
}

function getAllStaffUsers() {
  return staffUsers;
}

// ----- Applications -----

function createApplication(vacancyId, userId) {
  const vacancy = getVacancy(vacancyId);
  if (!vacancy) return null;

  const existing = applications.find(a => a.vacancyId === vacancyId && a.applicantId === userId);
  if (existing) return existing;

  const applicant = applicants.find(a => a.id === userId);
  const createdAt = new Date().toISOString();
  const app = {
    id: uuid(),
    reference: `MAG-2026-A${String(appSeq++).padStart(4, '0')}`,
    applicantId: userId,
    applicantName: applicant ? `${applicant.firstName} ${applicant.lastName}` : 'Unknown',
    applicantEmail: applicant ? applicant.email : '',
    vacancyId,
    vacancyTitle: vacancy.title,
    vacancyReference: vacancy.reference,
    region: vacancy.region,
    courtType: vacancy.courtType,
    status: 'in_progress',
    currentFolder: 'draft',
    folderHistory: [{ folder: 'draft', enteredAt: createdAt, by: 'applicant', reason: 'Application started' }],
    comments: [],
    tags: [],
    currentStep: 'personal-information',
    submittedAt: null,
    createdAt,
    steps: {},
    eligibility: null,
    sjt: null,
    references: null,
    interview: null,
    dbs: null,
    recommendation: null,
    jo: null,
    appeal: null,
  };
  applications.push(app);
  return app;
}

function getApplication(id) {
  return applications.find(a => a.id === id);
}

function getMyApplications(userId) {
  return applications.filter(a => a.applicantId === userId);
}

function getAllApplications({ status, folder, region, vacancyId, search } = {}) {
  return applications.filter(a => {
    if (status && a.status !== status) return false;
    if (folder && a.currentFolder !== folder) return false;
    if (region && a.region !== region) return false;
    if (vacancyId && a.vacancyId !== vacancyId) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!a.reference.toLowerCase().includes(s) &&
          !a.applicantName.toLowerCase().includes(s)) return false;
    }
    return true;
  });
}

function saveStep(applicationId, stepName, formData) {
  const app = getApplication(applicationId);
  if (!app) return null;

  const hasData = Object.values(formData).some(v => v && v !== '');
  app.steps[stepName] = {
    stepName,
    formData,
    isComplete: hasData,
  };
  return app.steps[stepName];
}

function getStep(applicationId, stepName) {
  const app = getApplication(applicationId);
  if (!app || !app.steps[stepName]) return null;
  return app.steps[stepName];
}

function submitApplication(applicationId) {
  const app = getApplication(applicationId);
  if (!app) return null;
  const now = new Date().toISOString();
  app.status = 'submitted';
  app.submittedAt = now;
  app.currentFolder = 'system_new';
  app.folderHistory.push({ folder: 'system_new', enteredAt: now, by: 'system', reason: 'Application submitted' });
  return app;
}

// Legacy status updater, kept so old admin screens don't break.
function updateStatus(applicationId, status, reason) {
  const app = getApplication(applicationId);
  if (!app) return null;
  app.status = status;
  return app;
}

// Folder transitions — preferred API going forward.
function moveFolder(applicationId, toFolder, { by = 'staff', reason = '' } = {}) {
  const app = getApplication(applicationId);
  if (!app) return { ok: false, error: 'not-found' };
  const target = getFolder(toFolder);
  if (!target) return { ok: false, error: 'unknown-folder' };
  if (!canMoveTo(app.currentFolder, toFolder)) {
    return { ok: false, error: 'invalid-transition', from: app.currentFolder, to: toFolder };
  }
  app.currentFolder = toFolder;
  app.folderHistory.push({ folder: toFolder, enteredAt: new Date().toISOString(), by, reason });
  // Coarse status mirror for legacy screens
  if (toFolder === 'appointed') app.status = 'accepted';
  else if (toFolder === 'rejected' || toFolder === 'not_appointed') app.status = 'rejected';
  else if (app.status === 'in_progress' && toFolder !== 'draft') app.status = 'submitted';
  return { ok: true, application: app };
}

function addComment(applicationId, by, text) {
  const app = getApplication(applicationId);
  if (!app) return null;
  const entry = { by, at: new Date().toISOString(), text };
  app.comments.push(entry);
  return entry;
}

function addTag(applicationId, tag) {
  const app = getApplication(applicationId);
  if (!app) return null;
  if (!app.tags.includes(tag)) app.tags.push(tag);
  return app.tags;
}

function updateStageData(applicationId, stageKey, patch) {
  const app = getApplication(applicationId);
  if (!app) return null;
  app[stageKey] = { ...(app[stageKey] || {}), ...patch };
  return app[stageKey];
}

// ----- RYI Registrants -----

function createRyiRegistrant(input) {
  const r = {
    id: uuid(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    region: input.region,
    courtType: input.courtType,
    registeredAt: new Date().toISOString(),
    invitedToApplyAt: null,
  };
  ryiRegistrants.push(r);
  return r;
}

function getAllRyiRegistrants() {
  return ryiRegistrants;
}

function inviteRyiRegistrant(id) {
  const r = ryiRegistrants.find(x => x.id === id);
  if (!r) return null;
  r.invitedToApplyAt = new Date().toISOString();
  return r;
}

// ----- Interview slots -----

function getInterviewSlotsForVacancy(vacancyId, { availableOnly = false } = {}) {
  return interviewSlots.filter(s => {
    if (s.vacancyId !== vacancyId) return false;
    if (availableOnly && s.bookedByApplicationId) return false;
    return true;
  });
}

function getInterviewSlot(id) {
  return interviewSlots.find(s => s.id === id);
}

function createInterviewSlot(input) {
  const slot = {
    id: `slot-${uuid()}`,
    vacancyId: input.vacancyId,
    vacancyTitle: input.vacancyTitle,
    start: input.start,
    end: input.end,
    panel: input.panel || [],
    teamsLink: input.teamsLink || `https://teams.microsoft.com/l/meetup-join/mock-${uuid()}`,
    bookedByApplicationId: null,
  };
  interviewSlots.push(slot);
  return slot;
}

function bookInterviewSlot(slotId, applicationId) {
  const slot = getInterviewSlot(slotId);
  if (!slot || slot.bookedByApplicationId) return null;
  slot.bookedByApplicationId = applicationId;
  return slot;
}

// ----- Reports -----

function getReportSummary() {
  const byStatus = {};
  const byFolder = {};
  const byRegion = {};
  applications.forEach(a => {
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    byFolder[a.currentFolder] = (byFolder[a.currentFolder] || 0) + 1;
    if (a.status !== 'in_progress') {
      byRegion[a.region] = (byRegion[a.region] || 0) + 1;
    }
  });
  return {
    total: applications.length,
    totalApplications: applications.length,
    submitted: byStatus.submitted || 0,
    inProgress: byStatus.in_progress || 0,
    accepted: byStatus.accepted || 0,
    rejected: byStatus.rejected || 0,
    byStatus,
    byFolder,
    byRegion,
  };
}

module.exports = {
  // vacancies
  getVacancies,
  getAllVacancies,
  getVacancy,
  createVacancy,
  updateVacancy,

  // users
  getApplicant,
  getStaffUser,
  getAllApplicants,
  getAllStaffUsers,

  // applications (legacy + new)
  createApplication,
  getApplication,
  getMyApplications,
  getAllApplications,
  saveStep,
  getStep,
  submitApplication,
  updateStatus,
  moveFolder,
  addComment,
  addTag,
  updateStageData,

  // RYI
  createRyiRegistrant,
  getAllRyiRegistrants,
  inviteRyiRegistrant,

  // Interview slots
  getInterviewSlotsForVacancy,
  getInterviewSlot,
  createInterviewSlot,
  bookInterviewSlot,

  // reports
  getReportSummary,

  REGIONS: [...new Set(advisoryCommittees.map(ac => ac.region))],
};
