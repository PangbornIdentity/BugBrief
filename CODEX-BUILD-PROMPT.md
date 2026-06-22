# Codex Prompt - Build BugBrief With Agent Team

Copy/paste this prompt into a fresh Codex thread pointed at the `PangbornIdentity/BugBrief` repository.

---

You are the lead Codex agent for `BugBrief`, a public GitHub repository. Build a C# web application for storing, analyzing, and reporting bug information.

## Mission

Create BugBrief as a public-repo-safe C# web app that helps track bug influx over time, bug age, escaped bugs, unescaped defects, missed requirements, origin/source, diagnosis quality, fix quality, and follow-up quality for high-priority issues.

The app must be useful for my personal development workflow, but configurable enough that other teams can use different terminology, statuses, severities, and workflows.

## Critical Public Repo Constraint

This repository is public. Assume every committed file is world-readable.

Commit publicly:

- Source code.
- Synthetic fixtures and seed data only.
- Public-safe setup docs.
- Public `CHANGELOG.md` with sanitized user-facing changes.
- Test projects and generic CI that reveal no private infrastructure.

Do not commit:

- Jira API keys, exports, issue keys, ticket links, copied Jira text, attachments, customer names, real screenshots, production logs, stack traces with private paths, internal URLs, release pipeline runbooks, deployment topology, environment names, approval gates, rollback procedures, cloud account details, or secrets.
- Anything derived from Jira unless it has been transformed into anonymized requirements, field mappings, or aggregate metrics.

If you discover private or proprietary material locally, do not copy it into the repo. Summarize it privately in your response only when needed, and sanitize aggressively.

## Preferred Technical Direction

Use a C#/.NET application. MVC is fine, Razor Pages is fine, but choose the option that best supports a clean operational UI with charts and tables.

Recommended default:

- ASP.NET Core MVC or Razor Pages.
- Entity Framework Core.
- PostgreSQL as the primary database.
- Supabase may be used as managed Postgres/Auth/storage if appropriate, but the app should remain a .NET web app.
- Use JavaScript charting in Razor/MVC views: Chart.js, ApexCharts, or ECharts.
- Use Bootstrap, Tailwind, or another practical UI system, but keep the UI dense, scannable, and operational.
- Prefer a layered solution structure:
  - `BugBrief.Web`
  - `BugBrief.Application`
  - `BugBrief.Domain`
  - `BugBrief.Infrastructure`
  - `BugBrief.Tests.Unit`
  - `BugBrief.Tests.Integration`
  - `BugBrief.Tests.E2E` if browser tests are practical.

If Vercel is not appropriate for hosting the .NET app, say so clearly and recommend a .NET-friendly hosting path such as Azure App Service, Render, Railway, Fly.io, or container hosting. Do not force Vercel if it creates unnecessary architecture friction.

## Product Language And Domain Rules

The app must support configurable terminology.

My default terminology:

- "Bug" means an escaped issue.
- "Defect" means an unescaped issue caught before escape.
- Every bug/defect comes from an origin/source code or component.
- Every bug/defect is missed from a requirement.
- High-priority issues are P0, P1, and P2.
- For P0/P1/P2, track how well we diagnose, patch, follow up, and root-cause-fix.

Do not hard-code those words as the only possible vocabulary. Model them as configurable display terms and workflow records so another user can rename:

- Bug / defect / issue / incident.
- Escaped / unescaped.
- P0/P1/P2.
- Statuses.
- Sources/origins/components.
- Requirement categories.
- Diagnosis categories.
- Fix types.
- Fix quality ratings.

## Core Features

Build toward these capabilities:

- Create/edit/view issues.
- Classify as escaped bug or unescaped defect.
- Track severity and priority.
- Track status and configurable workflow.
- Track source/origin/component.
- Track missed requirement or requirement category.
- Track date opened, date detected, date triaged, date diagnosis started, date fixed, date verified, date closed.
- Track bug age and time in status.
- Track diagnosis quality for P0/P1/P2.
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

## Dashboard And Reporting Requirements

Charts and reports are first-class requirements.

Initial dashboards should include:

- Bug/defect influx over time.
- Escaped vs unescaped ratio over time.
- Open issue age distribution.
- P0/P1/P2 aging.
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

Keep reporting query logic in application/query services, not directly in controllers or views.

## Jira Discovery Requirement

Use Jira only as private discovery context.

If Jira credentials and configuration are available in Codex global settings or environment variables, use them. Do not ask me to paste tokens into the chat. If the Jira base URL, email/user, project keys, or credential names are missing, ask only for the missing non-secret configuration. Never print or commit the token.

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
   - Owns solution structure, domain model, EF Core design, configuration strategy, import boundaries, dependency rules, and technical tradeoffs.
   - Decides MVC vs Razor Pages based on the simplest maintainable path.

3. Data / Jira Integration Agent
   - Owns Jira metadata discovery, sanitized field mapping, import interfaces, import run model, importer idempotency, and synthetic fixture design.
   - Must never commit raw Jira data.

4. Fullstack Developer Agent
   - Owns implementation of the vertical slice: app shell, issue CRUD, configurable terminology, seeded demo data, dashboards, charts, and filters.
   - Must respect architecture boundaries and existing user edits.

5. QA / Test Agent
   - Owns test strategy, unit tests, integration tests, smoke tests, regression tests, accessibility checks, and verification reports.
   - Runs `dotnet build` and `dotnet test` before handoff.

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

1. Scaffold the .NET solution.
2. Add domain entities and EF Core migrations for:
   - project/workspace
   - issue
   - configurable statuses
   - configurable severities/priorities
   - terminology settings
   - source/origin/component
   - missed requirement category
   - diagnosis/fix quality fields
   - import run metadata
3. Add synthetic seed data only.
4. Build app shell and navigation.
5. Build issue list, detail, create, and edit.
6. Build dashboard with at least three charts:
   - issue influx over time
   - escaped vs unescaped
   - age by priority
7. Add reporting query services.
8. Add Jira discovery/import interfaces, even if the first pass is a dry-run or synthetic adapter.
9. Add tests.
10. Update public-safe changelog.

## Testing Requirements

Before handoff:

- Run `dotnet build`.
- Run `dotnet test`.
- Add unit tests for:
  - terminology/config behavior
  - status/severity normalization
  - report calculations
  - Jira field mapping with synthetic payloads
  - issue age and time-to-fix calculations
- Add integration tests for:
  - issue CRUD
  - dashboard query endpoints/services
  - import run creation with synthetic data
  - authorization or workspace isolation if auth/multi-user exists
- Add smoke tests for:
  - app starts
  - home/dashboard loads
  - issue list loads
  - create issue flow works with synthetic data
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

Public repo must not include:

- Private release pipeline implementation.
- Environment names.
- Deployment topology.
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

Avoid:

- Hero marketing pages.
- Decorative dashboards with little data density.
- One-hue palettes.
- Hard-coded company terminology.

## Definition Of Done

The first major handoff is done when:

- The repo builds.
- Tests pass.
- App runs locally.
- Public-safe docs exist.
- Issue CRUD works with synthetic data.
- Configurable terminology exists at least in seed/config form.
- Dashboard renders charts from real query services.
- Jira discovery/import boundary exists and does not commit private Jira data.
- `CHANGELOG.md` is updated with sanitized entries.
- Public-repo safety review is complete.

End your response with:

- Summary of what changed.
- Files changed.
- Commands run and results.
- Any blocked items, especially missing Jira configuration.
- Suggested next step.
