# Codex Prompt - Build BugBrief With Agent Team

Copy/paste this prompt into a fresh Codex thread pointed at the `PangbornIdentity/BugBrief` repository.

---

You are the lead Codex agent for `BugBrief`, a public GitHub repository. Build a public-repo-safe web application for storing, updating, analyzing, and reporting bug information.

## Mission

Create BugBrief as a Next.js + Supabase + Vercel application that helps track bug influx over time, bug age, escaped bugs, unescaped defects, missed requirements, origin/source, diagnosis quality, fix quality, follow-up quality, high-priority SLA compliance, and P0/P1/P2 time-to-fix trends.

The app must be useful for my personal development workflow, but configurable enough that other teams can use different terminology, statuses, severities, and workflows.

The app must expose a REST API so my AI tools can create, update, query, and report on issue data without me manually entering everything through the UI.

## Critical Public Repo Constraint

This repository is public. Assume every committed file is world-readable.

Commit publicly:

- Source code.
- Supabase migrations and RLS policies.
- Synthetic fixtures and seed data only.
- Public-safe setup docs.
- Public `CHANGELOG.md` with sanitized user-facing changes.
- Test projects and generic CI that reveal no private infrastructure.

Do not commit:

- Jira API keys, Supabase service role keys, Vercel tokens, `.env.local`, exports, issue keys, ticket links, copied Jira text, attachments, customer names, real screenshots, production logs, stack traces with private paths, internal URLs, release pipeline runbooks, deployment topology, environment names, approval gates, rollback procedures, cloud account details, or secrets.
- Anything derived from Jira unless it has been transformed into anonymized requirements, field mappings, or aggregate metrics.

If you discover private or proprietary material locally, do not copy it into the repo. Summarize it privately in your response only when needed, and sanitize aggressively.

## Preferred Technical Direction

Use the Vercel-native stack:

- Next.js App Router + TypeScript.
- Vercel for hosting the web app and REST API route handlers.
- Supabase Postgres for the relational database.
- Supabase Auth for user authentication.
- Supabase Row Level Security for user/workspace isolation.
- Supabase Storage for private attachments if attachments are implemented.
- Tailwind CSS + shadcn/ui-style primitives + lucide icons.
- TanStack Table for dense issue lists.
- Recharts, Tremor-style primitives, or ECharts for charts.
- React Hook Form + Zod for form validation.
- Vitest + Testing Library for unit/component tests.
- Playwright for E2E tests.

Do not build this as C#/.NET unless I explicitly reverse this decision later.

## Product Language And Domain Rules

The app must support configurable terminology.

My default terminology:

- "Bug" means an escaped issue.
- "Defect" means an unescaped issue caught before escape.
- Every bug/defect comes from an origin/source code, component, area, or system.
- Every bug/defect is missed from a requirement.
- High-priority issues are P0, P1, and P2.
- For P0/P1/P2, track how well we diagnose, patch, follow up, root-cause-fix, and meet time-to-fix SLAs.

Do not hard-code those words as the only possible vocabulary. Model them as configurable display terms and workflow records so another user can rename:

- Bug / defect / issue / incident.
- Escaped / unescaped.
- P0/P1/P2.
- SLA labels and thresholds.
- Statuses.
- Sources/origins/components.
- Requirement categories.
- Diagnosis categories.
- Fix types.
- Fix quality ratings.

## Core Features

Build toward these capabilities:

- Supabase Auth sign-up/sign-in/sign-out.
- Workspace/project model, even if MVP creates one default workspace per user.
- Create/edit/view issues.
- Classify as escaped bug or unescaped defect.
- Track severity and priority.
- Track status and configurable workflow.
- Track source/origin/component.
- Track missed requirement or requirement category.
- Track date opened, date detected, date triaged, date diagnosis started, date fixed, date verified, date closed.
- Track bug age, time in status, and time to fix.
- Track diagnosis quality for P0/P1/P2.
- Track configurable SLA targets for high-priority issues: P0 same local day by default, P1 warning at 3 days and breach after 5 days by default, P2 breach after 15 days by default.
- Track fix approach:
  - quick patch
  - patch plus follow-up
  - root-cause fix
  - workaround
  - duplicate
  - cannot reproduce
- Track follow-up quality and reopen/regression behavior.
- Track reporter/source channel if known.
- Track labels/tags.
- Store synthetic demo data.
- Provide filtered lists and saved views.
- Provide dashboards and charts.
- Provide CSV export from filtered views.
- Provide API key management for AI/API clients.
- Provide an OpenAPI document for the REST API.
- Audit all AI/API writes.
- Compute SLA state for open and fixed/closed high-priority issues: within SLA, at risk, breached, met, missed.

## REST API Requirements For AI Clients

Expose versioned REST endpoints under `/api/v1`.

Minimum API surface:

```text
GET    /api/v1/health
GET    /api/v1/openapi.json

GET    /api/v1/issues
POST   /api/v1/issues
GET    /api/v1/issues/{id}
PATCH  /api/v1/issues/{id}
DELETE /api/v1/issues/{id}

GET    /api/v1/config/terminology
GET    /api/v1/config/statuses
GET    /api/v1/config/priorities
GET    /api/v1/config/sources
GET    /api/v1/config/requirement-categories

GET    /api/v1/reports/influx
GET    /api/v1/reports/aging
GET    /api/v1/reports/escaped-ratio
GET    /api/v1/reports/priority-diagnostics
GET    /api/v1/reports/sla
GET    /api/v1/reports/time-to-fix

POST   /api/v1/import/jira/discover
POST   /api/v1/import/jira/sync
GET    /api/v1/import/runs
GET    /api/v1/import/runs/{id}
```

API rules:

- Browser users authenticate with Supabase Auth.
- AI clients authenticate with app-generated API keys, not the Supabase service role key.
- API keys must be hashed at rest.
- Plaintext API keys are shown once.
- Support scoped API keys: read-only, issue write, import, admin.
- Log API requests in an audit table: key id/name, actor, method, path, status, duration, timestamp, and body hash for writes.
- Never log full request bodies by default.
- Use Zod schemas for request validation.
- Return consistent JSON envelopes for success and errors.
- Generate or maintain `/api/v1/openapi.json` so AI tools can understand the API contract.

## Dashboard And Reporting Requirements

Charts and reports are first-class requirements.

Initial dashboards should include:

- Bug/defect influx over time.
- Escaped vs unescaped ratio over time.
- Open issue age distribution.
- P0/P1/P2 aging.
- P0/P1/P2 SLA compliance over time.
- P0/P1/P2 time-to-fix trend over time.
- Open high-priority bugs that are at risk or breached.
- SLA breach rate and at-risk count by priority/team/source.
- Severity/priority distribution.
- Status distribution.
- Bugs by origin/source/component.
- Bugs by missed requirement category.
- Mean time to triage.
- Mean time to diagnose.
- Mean time to fix.
- Mean time to close.
- Reopen rate.
- Patch vs root-cause-fix ratio.
- Follow-up completion rate for high-priority issues.
- Recurring source/origin hotspots.

Keep reporting query logic in server-side query modules, not directly in React components.

## Jira Discovery Requirement

Use Jira only as private discovery context.

If Jira credentials and configuration are available in Codex global settings, secret files, connectors, or environment variables, use them. Check the global Codex configuration area for Jira/Atlassian credentials before asking me for anything. Do not ask me to paste tokens into the chat. If the Jira base URL, email/user, project keys, or credential names are missing, ask only for the missing non-secret configuration. Never print or commit credential paths, tokens, raw values, or raw Jira payloads.

Discovery target:

- Query Jira metadata for projects, issue types, statuses, workflows if available, priorities, resolutions, and all field types including custom fields.
- Query tickets from the current calendar year that are issue type `Bug`, `Defect`, or equivalent, including tickets opened, updated, resolved, or otherwise actioned during the year.
- Inspect custom fields used on those tickets.
- Infer a sanitized field mapping from Jira into BugBrief's normalized model.

Use a JQL shape like this as a starting point, then adapt to actual Jira metadata:

```text
issuetype in (Bug, Defect)
AND (created >= startOfYear() OR updated >= startOfYear() OR resolved >= startOfYear())
ORDER BY created DESC
```

Jira output rules:

- Do not commit raw Jira payloads.
- Do not commit issue keys, titles, descriptions, comments, attachments, URLs, user names, customer names, or screenshots.
- You may commit a sanitized mapping document such as `docs/jira-field-mapping.example.md` if it contains only generic field names, anonymized custom-field IDs, and no private values.
- You may commit tests using synthetic Jira-like fixtures that you create by hand.
- If Jira access is unavailable, proceed with a clean synthetic model and document the Jira discovery task as a private follow-up.

## Agent Team

Act as the lead integrator. Spawn subagents only when doing so materially helps and the work can be split cleanly. If the Codex environment only supports generic `default`, `explorer`, or `worker` subagents, create role-specific task briefs for those agents.

Recommended team:

1. Product Owner / UX Designer Agent
   - Owns product brief, terminology model, user flows, dashboard requirements, wireframe notes, empty/error/loading states, and acceptance criteria.
   - Ensures the UI is operational, dense, and useful rather than decorative.

2. Architect Agent
   - Owns Next.js/Supabase architecture, database schema, RLS model, REST API boundaries, API key auth, import boundaries, dependency rules, and technical tradeoffs.

3. Data / Jira Integration Agent
   - Owns Jira metadata discovery, sanitized field mapping, import interfaces, import run model, importer idempotency, and synthetic fixture design.
   - Must never commit raw Jira data.

4. Fullstack Developer Agent
   - Owns implementation of the vertical slice: app shell, issue CRUD, configurable terminology, seeded demo data, REST API, dashboards, charts, and filters.
   - Must respect architecture boundaries and existing user edits.

5. QA / Test Agent
   - Owns test strategy, unit tests, integration tests, Playwright tests, smoke tests, regression tests, accessibility checks, and verification reports.
   - Runs the project build/test/lint commands before handoff.

6. Public Repo Safety / Docs Agent
   - Owns README, public-safe changelog, setup docs, `.gitignore`, `.env.example`, secret scanning, and release-hygiene review.
   - Ensures private release pipeline information is not documented in the public repo.

If you suggest a smaller team, use:

- Architect/Product combined planning agent.
- Fullstack implementation agent.
- QA/Safety agent.

## Required Planning Artifacts

Before broad implementation, create or update public-safe docs:

- `docs/PRODUCT-BRIEF.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA-MODEL.md`
- `docs/API.md`
- `docs/USER-FLOWS.md`
- `docs/TEST-PLAN.md`
- `docs/PUBLIC-REPO-SAFETY.md`
- `CHANGELOG.md`
- `.env.example`
- `.gitignore`

Keep these docs generic and public-safe.

Do not create public release pipeline runbooks. If release/deployment steps are needed, add a short public note that private deployment, promotion, rollback, approvals, and environment-specific pipeline details belong in internal/private documentation.

## Implementation Strategy

Start with a small coherent vertical slice:

1. Scaffold the Next.js App Router + TypeScript project.
2. Add Tailwind, shadcn/ui-style primitives, lucide icons, TanStack Table, charting, Zod, and test tooling.
3. Add Supabase client/server helpers and `.env.example`.
4. Add Supabase migrations and RLS policies for:
   - profiles
   - workspaces/projects
   - workspace members
   - issues
   - configurable terminology
   - configurable statuses
   - configurable severities/priorities
   - source/origin/component
   - missed requirement category
   - diagnosis/fix quality fields
   - SLA policies and per-issue SLA state
   - labels
   - API keys
   - API audit log
   - import run metadata
5. Add synthetic seed data only.
6. Build app shell and navigation.
7. Build issue list, detail, create, and edit.
8. Build REST API route handlers under `/api/v1`.
9. Build API key management.
10. Build dashboard with at least three charts:
   - issue influx over time
   - escaped vs unescaped
   - age by priority
11. Add reporting query services.
12. Add Jira discovery/import interfaces, even if the first pass is a dry-run or synthetic adapter.
13. Add tests.
14. Update public-safe changelog.

## Testing Requirements

Before handoff:

- Run the package manager install/build/test/lint commands used by the project.
- Recommended commands after scaffolding:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npm run test:e2e`
  - `npm run build`
- Add unit tests for:
  - terminology/config behavior
  - status/severity normalization
  - report calculations
  - API request validation
  - API key hashing/auth behavior
  - Jira field mapping with synthetic payloads
  - issue age, time-to-fix, and SLA state calculations
- Add integration tests for:
  - issue CRUD route handlers
  - dashboard, SLA, and report query services
  - import run creation with synthetic data
  - workspace isolation / RLS assumptions
- Add Playwright tests for:
  - app loads
  - sign-in or demo mode loads
  - dashboard loads
  - issue list loads
  - create issue flow works with synthetic data
  - charts render nonblank
- Use only synthetic fixtures.
- Report exact commands run and whether they passed.

## Changelog Rules

Maintain `CHANGELOG.md`.

Use public-safe categories:

- Added
- Changed
- Fixed
- Security
- Deprecated

Do not include Jira keys, internal team names, private project names, customer details, incident names, exploit details, private URLs, or release pipeline details.

## Release Pipeline Rules

Public repo may include:

- Build instructions.
- Test instructions.
- Local development run instructions.
- Generic CI that runs build/test only, if it does not disclose private infrastructure.
- Vercel deployment overview at a generic level.

Public repo must not include:

- Private release pipeline implementation.
- Environment names.
- Deployment topology beyond generic Vercel/Supabase setup.
- Approval gates.
- Secret names beyond generic examples.
- Rollback runbooks.
- Cloud account or subscription details.
- Internal release calendars.

If release pipeline details are needed, create a placeholder note pointing to private/internal documentation, but do not create that private documentation in this public repo.

## UX Direction

Build the actual application UI, not a marketing landing page.

The UI should be:

- Dense but readable.
- Fast for repeated use.
- Table- and filter-friendly.
- Chart-friendly.
- Mobile-capable for quick bug capture.
- Accessible.
- Professional and restrained.

Use:

- Clear severity and status chips.
- Sortable tables.
- Date range filters.
- Saved views if practical.
- Drill-down from charts to filtered issue lists.
- Empty/loading/error states.
- Icons from lucide where appropriate.

Avoid:

- Hero marketing pages.
- Decorative dashboards with little data density.
- One-hue palettes.
- Hard-coded company terminology.

## Definition Of Done

The first major handoff is done when:

- The repo builds.
- Tests pass or any failures are clearly explained with next steps.
- App runs locally.
- Public-safe docs exist.
- Issue CRUD works with synthetic data.
- Configurable terminology exists at least in seed/config form.
- REST API route handlers exist for issue CRUD and core reports.
- API key strategy exists for AI clients.
- Dashboard renders charts from real query services, including high-priority SLA/time-to-fix trends.
- Jira discovery/import boundary exists and does not commit private Jira data.
- `CHANGELOG.md` is updated with sanitized entries.
- Public-repo safety review is complete.

End your response with:

- Summary of what changed.
- Files changed.
- Commands run and results.
- Any blocked items, especially missing Jira configuration.
- Suggested next step.
