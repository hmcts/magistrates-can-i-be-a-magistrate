/**
 * Prototype explorer's guide.
 *
 * No auth required — these pages help someone new to the prototype find their
 * way around. The "Sign in as" shortcuts bypass the normal sign-in flow and
 * put a selected user straight into the session.
 */

const express = require('express');
const router = express.Router();
const store = require('../services/store');
const { folderList, getFolder } = require('../services/folders');

// Pipeline stages, each mapping to one or more folder keys + demo paths
const stages = [
  {
    id: 1,
    name: 'Register Your Interest (RYI)',
    summary: 'Prospective applicant leaves their details so they can be invited when a vacancy opens.',
    demoApplicant: { label: 'Register interest', href: '/register-your-interest' },
    demoStaff: { label: 'View RYI registrants', href: '/staff/ryi' },
    folders: [],
  },
  {
    id: 2,
    name: 'Vacancy management',
    summary: 'Advisory Committee posts, edits, extends, un-posts or closes a vacancy.',
    demoApplicant: { label: 'Browse vacancies', href: '/vacancies' },
    demoStaff: { label: 'Manage vacancies', href: '/staff/vacancies' },
    folders: [],
  },
  {
    id: 3,
    name: 'Application',
    summary: '8-step application form. Candidates in the "Draft" or "System — New" folders.',
    demoApplicant: { label: 'My applications', href: '/application/my-applications' },
    demoStaff: { label: 'System — New candidates', href: '/staff/candidates?folder=system_new' },
    folders: ['draft', 'system_new'],
  },
  {
    id: 4,
    name: 'Eligibility Review',
    summary: 'AC Support + Advisory Committee review eligibility before the SJT is issued.',
    demoStaff: { label: 'Eligibility review queue', href: '/staff/candidates?folder=eligibility_review' },
    folders: ['eligibility_review'],
  },
  {
    id: 5,
    name: 'Situational Judgement Test (SJT)',
    summary: 'Candidates complete the Tazio SJT. Mocked here — pass/fail captured manually.',
    demoStaff: { label: 'SJT candidates', href: '/staff/candidates?folder=sjt' },
    folders: ['sjt', 'sjt_passed'],
  },
  {
    id: 6,
    name: 'References',
    summary: 'After SJT pass, 2 references are requested. Candidate supplies referee details.',
    demoApplicant: { label: 'Submit references (John Doe)', href: '/guide/as-applicant?demoStage=references' },
    demoStaff: { label: 'References in flight', href: '/staff/candidates?folder=references_request' },
    folders: ['references_request', 'references_received'],
  },
  {
    id: 7,
    name: 'Ready for Interview',
    summary: 'Interview slots set up; candidate self-books via the ATS.',
    demoApplicant: { label: 'Book interview (John Doe)', href: '/guide/as-applicant?demoStage=book' },
    demoStaff: { label: 'Ready for interview', href: '/staff/candidates?folder=ready_for_interview' },
    folders: ['ready_for_interview'],
  },
  {
    id: 8,
    name: 'Interview',
    summary: 'Panel conducts the interview (Teams link), records score and outcome.',
    demoStaff: { label: 'Interviews', href: '/staff/candidates?folder=interview' },
    folders: ['interview'],
  },
  {
    id: 9,
    name: 'DBS Check',
    summary: 'Digital DBS via Referoo (mocked) or offline certificate upload.',
    demoApplicant: { label: 'Upload DBS cert', href: '/guide/as-applicant?demoStage=dbs' },
    demoStaff: { label: 'DBS tracking', href: '/staff/candidates?folder=digital_dbs' },
    folders: ['digital_dbs', 'offline_dbs', 'dbs_complete'],
  },
  {
    id: 10,
    name: 'Recommendation',
    summary: 'AC Quorum decides whether to recommend appointment.',
    demoStaff: { label: 'Recommendation queue', href: '/staff/candidates?folder=recommendation' },
    folders: ['recommendation'],
  },
  {
    id: 11,
    name: 'JO Review / SPJ decision',
    summary: 'Judicial Office HR prepares papers; Senior Presiding Judge decides.',
    demoStaff: { label: 'JO review', href: '/staff/candidates?folder=jo_review' },
    folders: ['jo_review'],
  },
  {
    id: 12,
    name: 'Appointment / Not Appointed',
    summary: 'Outcome: appointment letter issued, or candidate notified they have not been appointed.',
    demoStaff: { label: 'Appointed', href: '/staff/candidates?folder=appointed' },
    folders: ['appointed', 'not_appointed', 'rejected'],
  },
  {
    id: 13,
    name: 'Appeals',
    summary: 'Rejected candidate may request AC Review and, optionally, SPJ Review.',
    demoApplicant: { label: 'Submit appeal (Tom Reid)', href: '/guide/as-applicant?demoStage=appeal' },
    demoStaff: { label: 'Appeals queue', href: '/staff/appeals' },
    folders: ['appeal'],
  },
];

function buildStageCandidateLookup() {
  const byFolder = {};
  store.getAllApplications().forEach(a => {
    if (!byFolder[a.currentFolder]) byFolder[a.currentFolder] = [];
    byFolder[a.currentFolder].push(a);
  });
  return byFolder;
}

router.get('/', (req, res) => {
  const byFolder = buildStageCandidateLookup();
  const stagesWithCandidates = stages.map(s => ({
    ...s,
    candidates: s.folders.flatMap(f => (byFolder[f] || []).slice(0, 2)),
  }));
  res.render('pages/guide/index.njk', {
    stages: stagesWithCandidates,
    applicants: store.getAllApplicants(),
    staffUsers: store.getAllStaffUsers(),
    getFolder,
  });
});

router.get('/test-users', (req, res) => {
  res.render('pages/guide/test-users.njk', {
    applicants: store.getAllApplicants(),
    staffUsers: store.getAllStaffUsers(),
  });
});

router.get('/seeded-data', (req, res) => {
  const candidates = store.getAllApplications();
  res.render('pages/guide/seeded-data.njk', {
    candidates,
    folders: folderList,
    getFolder,
  });
});

// One-click sign-in shortcut. For applicants and staff users.
router.get('/as/:userId', (req, res) => {
  const redirect = req.query.redirect || '/';
  const applicant = store.getApplicant(req.params.userId);
  if (applicant) {
    req.session.user = applicant;
    return res.redirect(redirect);
  }
  const staff = store.getStaffUser(req.params.userId);
  if (staff) {
    req.session.staffUser = staff;
    req.session.adminUser = staff;
    return res.redirect(redirect);
  }
  res.status(404).render('pages/errors/404.njk');
});

// Convenience: sign in as the applicant whose demoStage matches, then redirect to the right applicant page
router.get('/as-applicant', (req, res) => {
  const { demoStage } = req.query;
  const applicants = store.getAllApplicants();
  const applicant = applicants.find(a => a.demoStage === demoStage)
    || applicants.find(a => a.demoStage === 'ready_for_interview');
  if (!applicant) return res.redirect('/guide');

  req.session.user = applicant;

  // Find that applicant's seeded application (if any)
  const apps = store.getMyApplications(applicant.id);
  const app = apps[0];

  if (!app) return res.redirect('/application/my-applications');

  switch (demoStage) {
    case 'references':   return res.redirect(`/application/${app.id}/references`);
    case 'book':         return res.redirect(`/application/${app.id}/interview/book`);
    case 'dbs':          return res.redirect(`/application/${app.id}/dbs/upload`);
    case 'appeal':       return res.redirect(`/application/${app.id}/appeal`);
    default:             return res.redirect(`/application/${app.id}/status`);
  }
});

module.exports = router;
