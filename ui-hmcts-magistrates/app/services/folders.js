/**
 * Folder metadata + allowed transitions for the 13-stage magistrates pipeline.
 * Modelled on the Affinix ATS folder-based workflow (see process map v6.9).
 *
 * Each application has a `currentFolder` that moves through this graph.
 * Terminal folders (`appointed`, `not_appointed`, `rejected`, `withdrawn`) have no next steps.
 */

const folders = {
  draft: {
    key: 'draft',
    name: 'Draft',
    group: 'applicant',
    stage: 3,
    description: 'Application is in progress but not yet submitted.',
    tagColour: 'grey',
    nextFolders: ['system_new', 'withdrawn'],
  },
  system_new: {
    key: 'system_new',
    name: 'System — New',
    group: 'eligibility',
    stage: 3,
    description: 'Submitted application awaiting initial checks.',
    tagColour: 'blue',
    nextFolders: ['eligibility_review', 'sjt', 'rejected', 'withdrawn'],
  },
  eligibility_review: {
    key: 'eligibility_review',
    name: 'Eligibility Review',
    group: 'eligibility',
    stage: 4,
    description: 'AC Support and the Advisory Committee are reviewing eligibility.',
    tagColour: 'light-blue',
    nextFolders: ['sjt', 'rejected', 'withdrawn'],
  },
  sjt: {
    key: 'sjt',
    name: 'SJT',
    group: 'sjt',
    stage: 5,
    description: 'Candidate has been invited to the Situational Judgement Test.',
    tagColour: 'purple',
    nextFolders: ['sjt_passed', 'rejected', 'withdrawn'],
  },
  sjt_passed: {
    key: 'sjt_passed',
    name: 'SJT Passed',
    group: 'sjt',
    stage: 6,
    description: 'Candidate has passed the SJT and is ready for references.',
    tagColour: 'turquoise',
    nextFolders: ['references_request', 'rejected', 'withdrawn'],
  },
  references_request: {
    key: 'references_request',
    name: 'References Requested',
    group: 'references',
    stage: 6,
    description: 'Referees have been contacted; awaiting responses.',
    tagColour: 'yellow',
    nextFolders: ['references_received', 'rejected', 'withdrawn'],
  },
  references_received: {
    key: 'references_received',
    name: 'References Received',
    group: 'references',
    stage: 6,
    description: 'Both references returned; candidate ready for interview setup.',
    tagColour: 'yellow',
    nextFolders: ['ready_for_interview', 'rejected', 'withdrawn'],
  },
  ready_for_interview: {
    key: 'ready_for_interview',
    name: 'Ready for Interview',
    group: 'interview',
    stage: 7,
    description: 'Interview slots available; candidate can self-book.',
    tagColour: 'pink',
    nextFolders: ['interview', 'rejected', 'withdrawn'],
  },
  interview: {
    key: 'interview',
    name: 'Interview',
    group: 'interview',
    stage: 8,
    description: 'Interview booked, conducted, or awaiting outcome.',
    tagColour: 'pink',
    nextFolders: ['digital_dbs', 'offline_dbs', 'rejected', 'withdrawn'],
  },
  digital_dbs: {
    key: 'digital_dbs',
    name: 'DBS — Digital',
    group: 'dbs',
    stage: 9,
    description: 'Digital DBS check in progress via Referoo.',
    tagColour: 'orange',
    nextFolders: ['dbs_complete', 'rejected', 'withdrawn'],
  },
  offline_dbs: {
    key: 'offline_dbs',
    name: 'DBS — Offline',
    group: 'dbs',
    stage: 9,
    description: 'Offline DBS certificate pending upload.',
    tagColour: 'orange',
    nextFolders: ['dbs_complete', 'rejected', 'withdrawn'],
  },
  dbs_complete: {
    key: 'dbs_complete',
    name: 'DBS Complete',
    group: 'dbs',
    stage: 9,
    description: 'DBS check complete; candidate moving to recommendation.',
    tagColour: 'orange',
    nextFolders: ['recommendation', 'rejected', 'withdrawn'],
  },
  recommendation: {
    key: 'recommendation',
    name: 'Recommendation',
    group: 'recommendation',
    stage: 10,
    description: 'AC Quorum is considering the recommendation.',
    tagColour: 'green',
    nextFolders: ['jo_review', 'rejected', 'withdrawn'],
  },
  jo_review: {
    key: 'jo_review',
    name: 'JO Review',
    group: 'appointment',
    stage: 11,
    description: 'Judicial Office HR preparing papers for the Senior Presiding Judge.',
    tagColour: 'green',
    nextFolders: ['appointed', 'not_appointed', 'withdrawn'],
  },
  appointed: {
    key: 'appointed',
    name: 'Appointed',
    group: 'outcome',
    stage: 12,
    description: 'Candidate has been appointed as a magistrate.',
    tagColour: 'green',
    nextFolders: [],
    terminal: true,
  },
  not_appointed: {
    key: 'not_appointed',
    name: 'Not Appointed',
    group: 'outcome',
    stage: 12,
    description: 'SPJ did not appoint; candidate may appeal.',
    tagColour: 'red',
    nextFolders: ['appeal'],
    terminal: false,
  },
  rejected: {
    key: 'rejected',
    name: 'Rejected',
    group: 'outcome',
    stage: 12,
    description: 'Application rejected at some stage; candidate may appeal.',
    tagColour: 'red',
    nextFolders: ['appeal'],
    terminal: false,
  },
  withdrawn: {
    key: 'withdrawn',
    name: 'Withdrawn',
    group: 'outcome',
    stage: 12,
    description: 'Candidate withdrew their application.',
    tagColour: 'grey',
    nextFolders: [],
    terminal: true,
  },
  appeal: {
    key: 'appeal',
    name: 'Appeal',
    group: 'appeal',
    stage: 13,
    description: 'Appeal under review by Advisory Committee or SPJ.',
    tagColour: 'red',
    nextFolders: ['appointed', 'rejected'],
    terminal: false,
  },
};

const folderList = Object.values(folders);

function getFolder(key) {
  return folders[key] || null;
}

function canMoveTo(fromKey, toKey) {
  const from = folders[fromKey];
  if (!from) return false;
  return from.nextFolders.includes(toKey);
}

function getNextFolders(fromKey) {
  const from = folders[fromKey];
  if (!from) return [];
  return from.nextFolders.map(k => folders[k]).filter(Boolean);
}

// Folders grouped by stage for the guide's pipeline view
function groupedByStage() {
  const groups = {};
  folderList.forEach(f => {
    if (!groups[f.stage]) groups[f.stage] = [];
    groups[f.stage].push(f);
  });
  return groups;
}

module.exports = {
  folders,
  folderList,
  getFolder,
  canMoveTo,
  getNextFolders,
  groupedByStage,
};
