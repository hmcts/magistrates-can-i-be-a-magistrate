/**
 * In-memory data store for prototype.
 * Replaces the Spring Boot API — all data lives here in memory.
 * Resets when the server restarts.
 */
const crypto = require('crypto');

const uuid = () => crypto.randomUUID();

// ----- Seed Data -----

const advisoryCommittees = [
  { id: uuid(), name: 'Greater London', region: 'London', courtType: 'criminal' },
  { id: uuid(), name: 'Inner London Family', region: 'London', courtType: 'family' },
  { id: uuid(), name: 'South East', region: 'South East', courtType: 'criminal' },
  { id: uuid(), name: 'South West', region: 'South West', courtType: 'criminal' },
  { id: uuid(), name: 'West Midlands', region: 'West Midlands', courtType: 'criminal' },
  { id: uuid(), name: 'East Midlands', region: 'East Midlands', courtType: 'criminal' },
  { id: uuid(), name: 'North West', region: 'North West', courtType: 'criminal' },
  { id: uuid(), name: 'North East', region: 'North East', courtType: 'criminal' },
  { id: uuid(), name: 'Yorkshire and Humber', region: 'Yorkshire and Humber', courtType: 'criminal' },
  { id: uuid(), name: 'East of England', region: 'East of England', courtType: 'criminal' },
  { id: uuid(), name: 'Wales', region: 'Wales', courtType: 'criminal' },
];

const vacancies = advisoryCommittees.map((ac, i) => ({
  id: uuid(),
  reference: `MAG-2026-${String(i + 1).padStart(5, '0')}`,
  title: `Magistrate - ${ac.name}`,
  description: `We are recruiting magistrates for the ${ac.name} advisory committee area. Magistrates are volunteers who hear cases in courts in their community.`,
  advisoryCommittee: ac.name,
  courtType: ac.courtType,
  region: ac.region,
  opensAt: '2026-01-01T00:00:00Z',
  closesAt: '2026-12-31T23:59:59Z',
  status: 'open',
}));

const applicants = [
  { id: '11111111-1111-1111-1111-111111111111', email: 'applicant@example.com', firstName: 'Jane', lastName: 'Smith' },
  { id: '22222222-2222-2222-2222-222222222222', email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
];

const applications = [];
let appSeq = 1;

// ----- Vacancies -----

function getVacancies({ region, courtType } = {}) {
  return vacancies.filter(v => {
    if (region && v.region !== region) return false;
    if (courtType && v.courtType !== courtType) return false;
    return v.status === 'open';
  });
}

function getVacancy(id) {
  return vacancies.find(v => v.id === id);
}

// ----- Applications -----

function createApplication(vacancyId, userId) {
  const vacancy = getVacancy(vacancyId);
  if (!vacancy) return null;

  const existing = applications.find(a => a.vacancyId === vacancyId && a.applicantId === userId);
  if (existing) return existing;

  const applicant = applicants.find(a => a.id === userId);
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
    currentStep: 'personal-information',
    submittedAt: null,
    createdAt: new Date().toISOString(),
    steps: {},
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

function getAllApplications({ status, region, search } = {}) {
  return applications.filter(a => {
    if (status && a.status !== status) return false;
    if (region && a.region !== region) return false;
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
  app.status = 'submitted';
  app.submittedAt = new Date().toISOString();
  return app;
}

function updateStatus(applicationId, status, reason) {
  const app = getApplication(applicationId);
  if (!app) return null;
  app.status = status;
  return app;
}

function getReportSummary() {
  const byStatus = {};
  const byRegion = {};
  applications.forEach(a => {
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    if (a.status !== 'in_progress') {
      byRegion[a.region] = (byRegion[a.region] || 0) + 1;
    }
  });
  return {
    totalApplications: applications.length,
    byStatus,
    byRegion,
  };
}

module.exports = {
  getVacancies,
  getVacancy,
  createApplication,
  getApplication,
  getMyApplications,
  getAllApplications,
  saveStep,
  getStep,
  submitApplication,
  updateStatus,
  getReportSummary,
  REGIONS: [...new Set(advisoryCommittees.map(ac => ac.region))],
};
