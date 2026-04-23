# Can I Be a Magistrate

Proof-of-concept replacement for the magistrates recruitment system ([magistrates.affinixats.co.uk](https://magistrates.affinixats.co.uk)).

## Deployed Prototype

Hosted prototype can be found [magistrates-can-i-be-a-magistrate](https://magistrates-can-i-be-a-magistrate.onrender.com/)

**Note** this is hosted on a free tier, so there may be a short delay on initial startup.

## Quick Start

```bash
./start.sh
```

Open **http://localhost:3000**

To stop: `./stop.sh` or `Ctrl+C`

**Requires:** Node.js 20+ ([download](https://nodejs.org))

> The start script installs dependencies automatically on first run.

## What This Is

A working prototype of the magistrates recruitment application, built with the [GOV.UK Design System](https://design-system.service.gov.uk/). All data is held in-memory — no database or backend needed.

### Features

- **11 vacancies** seeded across all regions (London, South East, Wales, etc.)
- **8-step application form** matching the current Affinix system:
  1. Personal Information
  2. Preliminary Questions
  3. Eligibility Questions
  4. Employment Questions
  5. Character Questions
  6. Additional Information
  7. Diversity Monitoring
  8. Declaration
- **Save and resume** — each step saves independently, come back later
- **Task list pattern** — GOV.UK standard for multi-step forms
- **Admin portal** — view, search, filter applications + basic MI reports
- **Mock authentication** — simulates GOV.UK One Login (applicants) and Azure Entra ID (admin)

## How to Use

### As an applicant

1. Go to http://localhost:3000
2. Click **Start now** → browse vacancies
3. Pick a vacancy → **Apply for this vacancy**
4. Sign in (select Jane Smith or John Doe)
5. Work through the 8-step form using the task list
6. Review your answers → Submit

### As an admin

1. Go to http://localhost:3000/admin
2. Sign in as Admin User
3. View/search/filter submitted applications
4. Change application status (under review, accepted, rejected)
5. View MI reports (totals by status and region)

## Project Structure

```
magistrates-can-i-be-a-magistrate/
├── start.sh                         Start the app
├── stop.sh                          Stop the app
├── README.md
└── ui-hmcts-magistrates/
    ├── server.js                    Express app entry point
    ├── package.json
    └── app/
        ├── views/pages/             Nunjucks templates (GOV.UK Design System)
        │   ├── index.njk            Start page
        │   ├── vacancies/           Vacancy search + detail
        │   ├── auth/                Mock sign-in
        │   ├── application/         Task list, form steps, check answers
        │   │   └── steps/           8 form step templates
        │   ├── admin/               Admin dashboard, application list, reports
        │   └── errors/              404 + 500 pages
        ├── routes/                  Express route handlers
        ├── services/store.js        In-memory data store + seed data
        └── middleware/auth.js       Authentication middleware
```

## Tech

| | |
|---|---|
| Framework | Express.js 5 |
| Templating | Nunjucks |
| Design system | GOV.UK Frontend 5.9 |
| Data | In-memory (resets on restart) |
| Auth | Stubbed — GOV.UK One Login / Azure Entra ID interfaces ready |

## Notes

- Data resets when the server restarts — this is intentional for a prototype
- Authentication is mocked with test users — in production this would use GOV.UK One Login for applicants and Azure Entra ID for admin staff
- The form fields and steps match the current Affinix application
