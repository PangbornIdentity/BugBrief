# BugBrief

BugBrief is a 0-to-1 bug reporting and bug intelligence web app. It helps capture structured bug and defect data, track high-priority SLA performance, and report on quality trends over time.

This repository is public by design. Do not commit proprietary data, real customer examples, production logs, screenshots with private information, Jira payloads, or secrets.

## Current Status

Bootstrap app slice:

- Next.js App Router and TypeScript app shell.
- Synthetic demo data by default, with optional local Supabase/Postgres mode.
- Dashboard with bug/defect influx, SLA outcomes, time-to-fix trends, and an SLA watchlist.
- REST API demo endpoints under `/api/v1`.
- Supabase migration draft with workspace-scoped tables and RLS policies.
- Unit tests for SLA and reporting logic.

## Local Development

Install dependencies:

```powershell
npm install
```

Run the local dev server:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

Run checks:

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

## Useful Local URLs

```text
http://localhost:3000
http://localhost:3000/api/health
http://localhost:3000/api/v1/issues
http://localhost:3000/api/v1/reports/sla
http://localhost:3000/api/v1/reports/time-to-fix
http://localhost:3000/api/v1/openapi.json
```

## Intended Stack

- Next.js App Router and TypeScript
- Tailwind CSS
- Recharts for dashboard charts
- Supabase Auth, Postgres, Storage, and Row Level Security
- Vercel hosting
- Vitest for unit tests

## Local Database

BugBrief can run with synthetic demo data or local Supabase/Postgres. See [Local Database](./docs/local-database.md).

## Environment

Copy `.env.example` to `.env.local` for local secrets when needed. Leave values blank until Supabase or Jira integration work begins.

```powershell
Copy-Item .env.example .env.local
```

Never commit `.env`, `.env.local`, real Jira credentials, Supabase service role keys, production URLs, or exported private issue data.

## Public Repo Safety

- Commit `.env.example`, never real env files.
- Use synthetic demo data only.
- Keep Supabase service role keys server-side and out of source control.
- Enable Row Level Security before writing user data to Supabase tables.
- Keep private deployment, release, and work pipeline details outside the public repo.

## Planning Docs

- [0 to 1 Product Scope](./BUGBRIEF-0-TO-1-SCOPE.md)
- [Codex Build Prompt](./CODEX-BUILD-PROMPT.md)
