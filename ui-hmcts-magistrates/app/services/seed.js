/**
 * Seed data for the prototype.
 *
 * Produces a realistic pipeline of candidates across all 13 stages so every
 * staff screen has something to show. All IDs are deterministic where useful
 * so that the explorer's guide can link directly to seeded records.
 */

const crypto = require('crypto');

const uuid = () => crypto.randomUUID();

// ----- Advisory Committees & Vacancies -----

const advisoryCommittees = [
  { id: 'ac-gl',  name: 'Greater London',       region: 'London',              courtType: 'criminal' },
  { id: 'ac-ilf', name: 'Inner London Family',  region: 'London',              courtType: 'family'   },
  { id: 'ac-se',  name: 'South East',           region: 'South East',          courtType: 'criminal' },
  { id: 'ac-sw',  name: 'South West',           region: 'South West',          courtType: 'criminal' },
  { id: 'ac-wm',  name: 'West Midlands',        region: 'West Midlands',       courtType: 'criminal' },
  { id: 'ac-em',  name: 'East Midlands',        region: 'East Midlands',       courtType: 'criminal' },
  { id: 'ac-nw',  name: 'North West',           region: 'North West',          courtType: 'criminal' },
  { id: 'ac-ne',  name: 'North East',           region: 'North East',          courtType: 'criminal' },
  { id: 'ac-yh',  name: 'Yorkshire and Humber', region: 'Yorkshire and Humber', courtType: 'criminal' },
  { id: 'ac-eoe', name: 'East of England',      region: 'East of England',     courtType: 'criminal' },
  { id: 'ac-w',   name: 'Wales',                region: 'Wales',               courtType: 'criminal' },
];

const vacancies = advisoryCommittees.map((ac, i) => ({
  id: `vac-${ac.id}`,
  reference: `MAG-2026-${String(i + 1).padStart(5, '0')}`,
  title: `Magistrate — ${ac.name}`,
  description: `We are recruiting magistrates for the ${ac.name} advisory committee area. Magistrates are volunteers who hear cases in courts in their community.`,
  advisoryCommittee: ac.name,
  advisoryCommitteeId: ac.id,
  courtType: ac.courtType,
  region: ac.region,
  opensAt:  '2026-01-01T00:00:00Z',
  closesAt: '2026-12-31T23:59:59Z',
  status: 'open',
  positionsAvailable: 10 + (i % 5),
}));

// ----- Applicants (6 test users, each tied to a different pipeline stage) -----

const applicants = [
  // Retained from original prototype so existing links keep working
  { id: '11111111-1111-1111-1111-111111111111', email: 'jane.smith@example.com', firstName: 'Jane',   lastName: 'Smith',   demoStage: 'draft' },
  { id: '22222222-2222-2222-2222-222222222222', email: 'john.doe@example.com',   firstName: 'John',   lastName: 'Doe',     demoStage: 'ready_for_interview' },
  // New seeded users at different stages
  { id: '33333333-3333-3333-3333-333333333333', email: 'aisha.khan@example.com', firstName: 'Aisha',  lastName: 'Khan',    demoStage: 'eligibility_review' },
  { id: '44444444-4444-4444-4444-444444444444', email: 'marcus.bell@example.com',firstName: 'Marcus', lastName: 'Bell',    demoStage: 'sjt' },
  { id: '55555555-5555-5555-5555-555555555555', email: 'priya.patel@example.com',firstName: 'Priya',  lastName: 'Patel',   demoStage: 'dbs_complete' },
  { id: '66666666-6666-6666-6666-666666666666', email: 'tom.reid@example.com',   firstName: 'Tom',    lastName: 'Reid',    demoStage: 'appeal' },
];

// ----- Staff users (five roles) -----

const staffUsers = [
  { id: 'staff-ac-support',  email: 'ac.support@hmcts.gov.uk',     firstName: 'Alex',    lastName: 'Morgan',  role: 'ac_support',        roleName: 'AC Support Team',              region: 'Greater London' },
  { id: 'staff-ac-panel',    email: 'panel.chair@hmcts.gov.uk',    firstName: 'Ruth',    lastName: 'Davies',  role: 'advisory_committee', roleName: 'Advisory Committee member',   region: 'Greater London' },
  { id: 'staff-jo-hr',       email: 'jo.hr@judiciary.uk',          firstName: 'Samir',   lastName: 'Ahmed',   role: 'jo_hr',              roleName: 'Judicial Office HR',           region: null },
  { id: 'staff-spj',         email: 'spj.office@judiciary.uk',     firstName: 'Eleanor', lastName: 'Clark',   role: 'spj_office',         roleName: 'SPJ Office',                   region: null },
  { id: 'staff-hmcts-hq',    email: 'hq.advanced@hmcts.gov.uk',    firstName: 'Olivia',  lastName: 'Wright',  role: 'hmcts_hq',           roleName: 'HMCTS HQ Advanced',            region: null },
  // Legacy admin user from the original prototype
  { id: 'admin-1',           email: 'admin@hmcts.gov.uk',          firstName: 'Admin',   lastName: 'User',    role: 'ac_support',         roleName: 'Admin User',                   region: null },
];

// ----- RYI Registrants -----

const ryiRegistrants = [
  { id: uuid(), firstName: 'Helen',  lastName: 'Carter', email: 'helen.carter@example.com', region: 'North West',           courtType: 'criminal', registeredAt: '2026-02-01T09:00:00Z', invitedToApplyAt: null },
  { id: uuid(), firstName: 'David',  lastName: 'Owen',   email: 'david.owen@example.com',   region: 'Wales',                courtType: 'criminal', registeredAt: '2026-02-05T14:30:00Z', invitedToApplyAt: '2026-02-12T10:00:00Z' },
  { id: uuid(), firstName: 'Sophie', lastName: 'Nguyen', email: 'sophie.nguyen@example.com',region: 'London',               courtType: 'family',   registeredAt: '2026-02-10T11:15:00Z', invitedToApplyAt: null },
  { id: uuid(), firstName: 'Ben',    lastName: 'Scott',  email: 'ben.scott@example.com',    region: 'Yorkshire and Humber', courtType: 'criminal', registeredAt: '2026-02-18T16:00:00Z', invitedToApplyAt: null },
  { id: uuid(), firstName: 'Iona',   lastName: 'Fraser', email: 'iona.fraser@example.com',  region: 'South West',           courtType: 'criminal', registeredAt: '2026-03-01T08:45:00Z', invitedToApplyAt: null },
];

// ----- Helper for building applications -----

let appSeq = 1;

function buildApplication({ applicant, vacancy, folder, days = 30, extras = {} }) {
  const submittedAt = folder === 'draft' ? null : new Date(Date.now() - days * 86400000).toISOString();
  const createdAt = new Date(Date.now() - (days + 7) * 86400000).toISOString();

  const ref = `MAG-2026-A${String(appSeq++).padStart(4, '0')}`;

  return {
    id: uuid(),
    reference: ref,
    applicantId: applicant.id,
    applicantName: `${applicant.firstName} ${applicant.lastName}`,
    applicantEmail: applicant.email,
    vacancyId: vacancy.id,
    vacancyTitle: vacancy.title,
    vacancyReference: vacancy.reference,
    region: vacancy.region,
    courtType: vacancy.courtType,
    currentFolder: folder,
    folderHistory: [
      { folder: 'system_new', enteredAt: submittedAt || createdAt, by: 'system', reason: 'Application submitted' },
    ],
    comments: [],
    tags: [],
    status: folder === 'draft' ? 'in_progress' : 'submitted',
    currentStep: 'personal-information',
    submittedAt,
    createdAt,
    steps: folder === 'draft' ? partialSteps(applicant) : completedSteps(applicant, vacancy),
    eligibility: null,
    sjt: null,
    references: null,
    interview: null,
    dbs: null,
    recommendation: null,
    jo: null,
    appeal: null,
    ...extras,
  };
}

function completedSteps(applicant, vacancy) {
  const steps = {};
  const names = [
    'personal-information',
    'preliminary-questions',
    'eligibility-questions',
    'employment-questions',
    'character-questions',
    'additional-information',
    'diversity-monitoring',
    'declaration',
  ];
  names.forEach(n => {
    steps[n] = { stepName: n, formData: sampleFormData(n, applicant, vacancy), isComplete: true };
  });
  return steps;
}

function partialSteps(applicant) {
  return {
    'personal-information': { stepName: 'personal-information', formData: sampleFormData('personal-information', applicant), isComplete: true },
    'preliminary-questions': { stepName: 'preliminary-questions', formData: sampleFormData('preliminary-questions', applicant), isComplete: true },
  };
}

function sampleFormData(stepName, applicant, vacancy = {}) {
  const common = {
    firstName: applicant.firstName,
    lastName: applicant.lastName,
    email: applicant.email,
    dateOfBirth: '1985-06-14',
    phone: '07700 900000',
    address: '12 Example Street, London, SW1A 1AA',
  };
  switch (stepName) {
    case 'personal-information':
      return common;
    case 'preliminary-questions':
      return { isBritishCitizen: 'yes', isOver18: 'yes', isUnder75: 'yes', livesInUK: 'yes' };
    case 'eligibility-questions':
      return { hasVisitedCourt: 'yes', visitCount: '3', committedOffences: 'no', declaredBankruptcy: 'no' };
    case 'employment-questions':
      return { employmentStatus: 'employed', employerName: 'Example Ltd', employerConsent: 'yes', timeCommitment: 'yes' };
    case 'character-questions':
      return { goodCharacter: 'yes', disciplinaryAction: 'no', politicalActivity: 'no' };
    case 'additional-information':
      return { referee1Name: 'Professor Sam Taylor', referee1Email: 'sam.taylor@example.com', referee2Name: 'Dr Chris Allen', referee2Email: 'chris.allen@example.com', reasonableAdjustments: 'no' };
    case 'diversity-monitoring':
      return { ethnicity: 'prefer-not-to-say', religion: 'prefer-not-to-say', sexualOrientation: 'prefer-not-to-say', disability: 'no' };
    case 'declaration':
      return { declarationAccepted: 'yes' };
    default:
      return {};
  }
}

// ----- Build the applications set -----

const [jane, john, aisha, marcus, priya, tom] = applicants;

const applications = [];

// --- Drafts (3) ---
applications.push(buildApplication({ applicant: jane,    vacancy: vacancies[0], folder: 'draft', days: 2 }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Rob',    lastName: 'Evans',   email: 'rob.evans@example.com' },   vacancy: vacancies[2], folder: 'draft', days: 4 }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Lily',   lastName: 'Wong',    email: 'lily.wong@example.com' },   vacancy: vacancies[4], folder: 'draft', days: 1 }));

// --- system_new (4) ---
for (let i = 0; i < 4; i++) {
  const v = vacancies[i % vacancies.length];
  applications.push(buildApplication({
    applicant: { id: uuid(), firstName: ['Kate','Ben','Zoe','Sam'][i], lastName: ['Hall','Price','Grant','Lee'][i], email: `seed${i}@example.com` },
    vacancy: v,
    folder: 'system_new',
    days: 3 + i,
  }));
}

// --- eligibility_review (3) — one with RA tag (applicant = Aisha) ---
applications.push(buildApplication({
  applicant: aisha,
  vacancy: vacancies[0],
  folder: 'eligibility_review',
  days: 10,
  extras: {
    tags: ['ra_sjt'],
    comments: [{ by: 'Alex Morgan (AC Support)', at: '2026-04-15T09:30:00Z', text: 'Candidate has requested extra time for the SJT — reasonable adjustment noted.' }],
    eligibility: { reviewedBy: null, outcome: 'pending', formUrl: null, notes: '' },
  },
}));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Noah', lastName: 'Patel', email: 'noah.patel@example.com' }, vacancy: vacancies[2], folder: 'eligibility_review', days: 9 }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Eva',  lastName: 'Brooks',email: 'eva.brooks@example.com' },  vacancy: vacancies[5], folder: 'eligibility_review', days: 8 }));

// --- sjt + sjt_passed (5) — Marcus is mid-SJT ---
applications.push(buildApplication({
  applicant: marcus,
  vacancy: vacancies[1],
  folder: 'sjt',
  days: 16,
  extras: {
    sjt: { invitedAt: '2026-04-12T10:00:00Z', completedAt: null, score: null, outcome: 'pending' },
    eligibility: { reviewedBy: 'Ruth Davies', outcome: 'pass', formUrl: '/mock/eligibility.pdf', notes: 'Eligible. Moved to SJT.' },
  },
}));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Rita', lastName: 'Shaw',   email: 'rita.shaw@example.com' },  vacancy: vacancies[3], folder: 'sjt',        days: 17 }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Leo',  lastName: 'Adams',  email: 'leo.adams@example.com' },  vacancy: vacancies[4], folder: 'sjt_passed', days: 22, extras: { sjt: { invitedAt: '2026-03-28T10:00:00Z', completedAt: '2026-04-05T14:00:00Z', score: 78, outcome: 'pass' } } }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Maya', lastName: 'Singh',  email: 'maya.singh@example.com' }, vacancy: vacancies[6], folder: 'sjt_passed', days: 23 }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Owen', lastName: 'Jones',  email: 'owen.jones@example.com' }, vacancy: vacancies[7], folder: 'sjt',        days: 15 }));

// --- references_request + references_received (4) ---
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Clare', lastName: 'Moore',  email: 'clare.moore@example.com' },  vacancy: vacancies[0], folder: 'references_request',  days: 28, extras: { references: { referee1: { name: 'Prof Green', email: 'green@example.com', status: 'pending'  }, referee2: { name: 'Dr White',   email: 'white@example.com', status: 'pending' },  requestedAt: '2026-04-05T09:00:00Z', receivedAt: null } } }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Henry', lastName: 'Clark',  email: 'henry.clark@example.com' },  vacancy: vacancies[2], folder: 'references_request',  days: 27 }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Ivy',   lastName: 'Walker', email: 'ivy.walker@example.com' },   vacancy: vacancies[4], folder: 'references_received', days: 35, extras: { references: { referee1: { name: 'Prof Chen',  email: 'chen@example.com',  status: 'received' }, referee2: { name: 'Dr Harris',  email: 'harris@example.com',status: 'received' }, requestedAt: '2026-03-18T09:00:00Z', receivedAt: '2026-03-28T12:00:00Z' } } }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Luca',  lastName: 'Rossi',  email: 'luca.rossi@example.com' },   vacancy: vacancies[6], folder: 'references_received', days: 37 }));

// --- ready_for_interview + interview (4) — John is ready_for_interview ---
applications.push(buildApplication({
  applicant: john,
  vacancy: vacancies[0],
  folder: 'ready_for_interview',
  days: 40,
  extras: {
    references: { referee1: { name: 'Prof Sam Taylor', email: 'sam.taylor@example.com', status: 'received' }, referee2: { name: 'Dr Chris Allen', email: 'chris.allen@example.com', status: 'received' }, requestedAt: '2026-03-10T09:00:00Z', receivedAt: '2026-03-20T11:00:00Z' },
    sjt: { invitedAt: '2026-02-20T10:00:00Z', completedAt: '2026-02-28T14:00:00Z', score: 82, outcome: 'pass' },
  },
}));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Nina',  lastName: 'Ahmed', email: 'nina.ahmed@example.com' }, vacancy: vacancies[2], folder: 'ready_for_interview', days: 42 }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Ravi',  lastName: 'Gupta', email: 'ravi.gupta@example.com' }, vacancy: vacancies[4], folder: 'interview', days: 48, extras: { interview: { slotId: 'slot-1', bookedAt: '2026-04-10T09:00:00Z', panel: ['Ruth Davies','Eleanor Clark'], teamsLink: 'https://teams.microsoft.com/l/meetup-join/mock-1', score: null, outcome: 'pending' } } }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Sara',  lastName: 'Young', email: 'sara.young@example.com' }, vacancy: vacancies[6], folder: 'interview', days: 50 }));

// --- DBS (3) — Priya is dbs_complete ---
applications.push(buildApplication({
  applicant: priya,
  vacancy: vacancies[1],
  folder: 'dbs_complete',
  days: 60,
  extras: {
    interview: { slotId: 'slot-2', bookedAt: '2026-03-15T09:00:00Z', panel: ['Ruth Davies','Samir Ahmed'], teamsLink: 'https://teams.microsoft.com/l/meetup-join/mock-2', score: 18, outcome: 'pass' },
    dbs: { type: 'digital', initiatedAt: '2026-03-25T10:00:00Z', idCheckStatus: 'verified', checkOutcome: 'clear', certUploadedAt: '2026-04-02T14:00:00Z', certFilename: 'dbs-cert-priya.pdf' },
  },
}));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Jack',  lastName: 'Turner', email: 'jack.turner@example.com' }, vacancy: vacancies[3], folder: 'digital_dbs', days: 55, extras: { dbs: { type: 'digital', initiatedAt: '2026-04-08T10:00:00Z', idCheckStatus: 'pending', checkOutcome: 'pending', certUploadedAt: null, certFilename: null } } }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Mia',   lastName: 'Foster', email: 'mia.foster@example.com' }, vacancy: vacancies[5], folder: 'offline_dbs', days: 58, extras: { dbs: { type: 'offline', initiatedAt: '2026-04-01T10:00:00Z', idCheckStatus: 'n/a', checkOutcome: 'awaiting_cert', certUploadedAt: null, certFilename: null } } }));

// --- Recommendation (2) ---
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Daniel',lastName: 'Cook',   email: 'daniel.cook@example.com' },  vacancy: vacancies[0], folder: 'recommendation', days: 70, extras: { recommendation: { decision: 'pending', appendixInfo: null, decidedAt: null } } }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Grace', lastName: 'Lloyd',  email: 'grace.lloyd@example.com' },  vacancy: vacancies[6], folder: 'recommendation', days: 68 }));

// --- JO Review + Appointed (2) ---
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Paul',  lastName: 'Baker',  email: 'paul.baker@example.com' },   vacancy: vacancies[2], folder: 'jo_review', days: 80, extras: { recommendation: { decision: 'recommend', appendixInfo: 'Strong candidate', decidedAt: '2026-04-01T12:00:00Z' }, jo: { submittedAt: '2026-04-03T09:00:00Z', spjDecision: 'pending', appointedAt: null, appointmentLetterUrl: null } } }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Freya', lastName: 'Hill',   email: 'freya.hill@example.com' },   vacancy: vacancies[4], folder: 'appointed', days: 90, extras: { recommendation: { decision: 'recommend', appendixInfo: null, decidedAt: '2026-03-20T12:00:00Z' }, jo: { submittedAt: '2026-03-22T09:00:00Z', spjDecision: 'appoint', appointedAt: '2026-04-10T09:00:00Z', appointmentLetterUrl: '/mock/appointment-freya.pdf' } } }));

// --- Rejected (3, at various stages) ---
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Charlie',lastName: 'West',   email: 'charlie.west@example.com' },vacancy: vacancies[1], folder: 'rejected', days: 30, extras: { comments: [{ by: 'Alex Morgan (AC Support)', at: '2026-03-25T09:00:00Z', text: 'Rejected at eligibility — declared bankruptcy within 5 years.' }] } }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Isla',  lastName: 'Murray', email: 'isla.murray@example.com' },  vacancy: vacancies[3], folder: 'rejected', days: 45, extras: { sjt: { invitedAt: '2026-03-01T10:00:00Z', completedAt: '2026-03-10T14:00:00Z', score: 42, outcome: 'fail' } } }));
applications.push(buildApplication({ applicant: { id: uuid(), firstName: 'Alan',  lastName: 'Knight', email: 'alan.knight@example.com' },  vacancy: vacancies[5], folder: 'rejected', days: 55 }));

// --- Appeals (2) — Tom has appealed ---
applications.push(buildApplication({
  applicant: tom,
  vacancy: vacancies[0],
  folder: 'appeal',
  days: 40,
  extras: {
    comments: [
      { by: 'Alex Morgan (AC Support)', at: '2026-03-20T09:00:00Z', text: 'Rejected at interview — did not demonstrate the required competencies.' },
      { by: 'Tom Reid (Applicant)',     at: '2026-04-01T10:00:00Z', text: 'Appeal submitted — questions the interview scoring.' },
    ],
    appeal: { stage: 'ac_review', lodgedAt: '2026-04-01T10:00:00Z', grounds: 'I believe the interview scoring did not reflect my answers accurately.', outcome: null },
    interview: { slotId: 'slot-3', bookedAt: '2026-03-05T09:00:00Z', panel: ['Ruth Davies','Eleanor Clark'], teamsLink: 'https://teams.microsoft.com/l/meetup-join/mock-3', score: 11, outcome: 'fail' },
  },
}));
applications.push(buildApplication({
  applicant: { id: uuid(), firstName: 'Wendy', lastName: 'Palmer', email: 'wendy.palmer@example.com' },
  vacancy: vacancies[3],
  folder: 'appeal',
  days: 50,
  extras: { appeal: { stage: 'spj_review', lodgedAt: '2026-03-25T09:00:00Z', grounds: 'Requesting SPJ review after AC rejection of first appeal.', outcome: null } },
}));

// Tag each application's folderHistory with its current folder if different from the initial system_new entry
applications.forEach(a => {
  if (a.currentFolder !== 'draft' && a.currentFolder !== 'system_new') {
    a.folderHistory.push({
      folder: a.currentFolder,
      enteredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      by: 'system',
      reason: 'Progressed through pipeline',
    });
  }
});

// ----- Interview slots (~15 across a few vacancies) -----

const interviewSlots = [];
const slotStart = new Date('2026-05-05T09:00:00Z').getTime();
for (let i = 0; i < 15; i++) {
  const vac = vacancies[i % 5];
  const start = new Date(slotStart + i * 86400000 * 0.5).toISOString();
  const end = new Date(slotStart + i * 86400000 * 0.5 + 90 * 60000).toISOString();
  interviewSlots.push({
    id: `slot-${i + 1}`,
    vacancyId: vac.id,
    vacancyTitle: vac.title,
    start,
    end,
    panel: ['Ruth Davies', 'Samir Ahmed'],
    teamsLink: `https://teams.microsoft.com/l/meetup-join/mock-${i + 1}`,
    bookedByApplicationId: i < 3 ? applications[i].id : null,
  });
}

module.exports = {
  advisoryCommittees,
  vacancies,
  applicants,
  staffUsers,
  ryiRegistrants,
  applications,
  interviewSlots,
};
