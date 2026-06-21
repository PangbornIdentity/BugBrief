# BugBrief - 0 to 1 Product Scope

Status: Design and scoping  
Audience: Owner, future contributors, and coding agents  
Repository posture: Public by default  
Recommended stack: Next.js on Vercel, Supabase for auth/database/storage

## 1. Product Thesis

BugBrief is a lightweight bug reporting and bug intelligence app. It helps individuals and small teams capture clean bug reports, triage them quickly, and report on quality trends without exposing sensitive company, customer, or product information in the public codebase.

The product should feel like an operational tool, not a marketing site. The first screen after sign-in should be the working dashboard: recent bugs, intake health, severity mix, and open triage work.

## 2. Non-Negotiables

- Public repo safe: no proprietary examples, customer names, internal URLs, production logs, screenshots, tokens, or seeded private data.
- Secrets stay out of git: all credentials live in Vercel and Supabase environment configuration; commit only `.env.example`.
- Authenticated app by default: bug data belongs to a user or workspace.
- Row Level Security first: every Supabase table containing user data must have RLS enabled before app code writes to it.
- Reports are structured, not just text blobs: the app must support trend reporting from day one.
- Mobile capable: bug capture should work from a phone, especially screenshot-plus-steps workflows.
- Useful without integrations: Jira/GitHub/Linear sync can come later; the MVP must stand alone.
- No private data in demo mode: demo content must be synthetic and obviously fake.

## 3. Public Git Safety Rules

Do commit:

- Source code, migrations, SQL policy files, tests, screenshots of synthetic demo data, design docs, README, `.env.example`.
- Placeholder config such as `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co`.
- Synthetic seed data with generic product areas like `Checkout`, `Dashboard`, `Login`, `API`.

Do not commit:

- `.env`, `.env.local`, Supabase service role keys, access tokens, production database dumps, real attachments, logs, browser HAR files, customer bug text, real screenshots, private URLs, or internal project names.
- Exported Supabase backups unless they are scrubbed and explicitly marked synthetic.
- Vercel project metadata that contains team-specific IDs if it is not needed for open source use.

Recommended root files:

```text
BugBrief/
  README.md
  BUGBRIEF-0-TO-1-SCOPE.md
  ARCHITECTURE.md
  DESIGN-SYSTEM.md
  USER-FLOWS.md
  TEST-PLAN.md
  SECURITY.md
  .env.example
  .gitignore
  src/
  supabase/
    migrations/
    seed.synthetic.sql
```

## 4. Target Users

Primary user: a builder, support lead, QA lead, product owner, or founder who needs to understand bug volume and quality signals across a small product.

Secondary user: a teammate or tester who needs to submit a clear bug report without learning a complex issue tracker.

Future user: an engineering manager who wants release health, severity trends, and time-to-resolution metrics.

## 5. Core Jobs To Be Done

- Capture a high-quality bug report in under two minutes.
- Triage new reports into actionable work.
- See which product areas are generating the most bugs.
- Understand whether quality is improving or degrading over time.
- Export or share a clean bug brief for a stakeholder update.
- Keep sensitive evidence private while still allowing structured reporting.

## 6. MVP Scope

### In Scope

- Supabase Auth sign-up/sign-in/sign-out.
- Workspace model, even if iteration 1 only creates one workspace per user.
- Bug CRUD: create, view, edit, assign owner, change status, close.
- Structured fields: title, description, reproduction steps, expected result, actual result, severity, priority, status, product area, environment, release/version, source, reporter, assignee, labels.
- Attachments: screenshots or small files stored in a private Supabase Storage bucket.
- Triage dashboard: new, open, high severity, blocked, recently closed.
- Reporting dashboard: bug volume over time, severity distribution, status distribution, top product areas, average time to triage, average time to close.
- Search and filters.
- Activity timeline for each bug.
- Public-safe synthetic demo seed.
- `/api/health` route for deployment checks.
- Basic CSV export for filtered bug lists.

### Out Of Scope For MVP

- Jira, GitHub Issues, Linear, Slack, or email sync.
- AI summarization or duplicate detection.
- Public unauthenticated bug intake forms.
- Complex custom fields.
- Multi-workspace billing.
- Role hierarchy beyond owner/member.
- Native mobile app.

## 7. Recommended Tech Stack

| Layer | Recommendation | Notes |
| --- | --- | --- |
| App framework | Next.js App Router + TypeScript | Natural fit for Vercel and Supabase SSR patterns. |
| Hosting | Vercel | Use Preview deployments for branches and Production for `main`. |
| Database | Supabase Postgres | Use migrations committed under `supabase/migrations`. |
| Auth | Supabase Auth | Email/password first; add OAuth later. |
| Authorization | Supabase RLS | Policies should enforce workspace membership and ownership. |
| File storage | Supabase Storage | Private bucket for bug attachments. |
| UI | Tailwind CSS + shadcn/ui-style primitives + lucide icons | Keep UI quiet, dense, and operational. |
| Forms | React Hook Form + Zod | Shared validation between UI and server actions. |
| Charts | Recharts or Tremor-style chart primitives | Keep charts simple and readable. |
| Testing | Vitest, Testing Library, Playwright | Unit for transforms, E2E for critical flows. |
| CI | GitHub Actions | Typecheck, lint, test, build. |

## 8. Information Architecture

Authenticated routes:

```text
/dashboard              Quality overview and triage queue
/bugs                   Bug list with search, filters, saved views
/bugs/new               New bug report form
/bugs/[id]              Bug detail, activity, attachments, edits
/reports                Trend reporting and export
/settings/workspace     Workspace name, members, default areas
/settings/profile       Current user profile
/settings/tags          Labels and product areas
```

Public routes:

```text
/login
/register
/forgot-password
/api/health
```

Avoid a marketing landing page until there is a reason for one. During MVP, root `/` can redirect authenticated users to `/dashboard` and unauthenticated users to `/login`.

## 9. Core User Flows

### Flow 1: First Sign-In

1. User registers.
2. System creates the user profile and a default workspace.
3. System seeds optional synthetic starter data only when demo mode is enabled.
4. User lands on `/dashboard`.
5. Empty state prompts user to create the first bug report.

Edge cases:

- Email already exists: show inline validation.
- Session expired: redirect to login and return to the requested page after sign-in.
- Workspace creation fails: show a recoverable setup screen.

### Flow 2: Submit A Bug

1. User opens `/bugs/new`.
2. User enters title, severity, product area, environment, steps to reproduce, expected result, and actual result.
3. User optionally attaches screenshots.
4. System validates required fields.
5. System creates the bug with status `new`.
6. User lands on `/bugs/[id]` with a success toast.

Required form fields:

- Title
- Severity
- Product area
- Steps to reproduce
- Actual result

Optional but encouraged:

- Expected result
- Environment
- Release/version
- Browser/device
- Attachment
- Labels

### Flow 3: Triage New Bugs

1. User opens `/dashboard`.
2. Triage queue shows newest `new` bugs first, with high severity pinned above normal severity.
3. User opens a bug.
4. User assigns priority, assignee, product area, and status.
5. System records each meaningful field change in the activity timeline.

Status transitions:

```text
new -> triaged -> in_progress -> fixed -> verified -> closed
new -> duplicate
new -> wont_fix
new -> needs_info
needs_info -> triaged
fixed -> reopened
closed -> reopened
```

### Flow 4: Report On Trends

1. User opens `/reports`.
2. User selects a date range.
3. Dashboard updates charts and KPI cards.
4. User filters by product area, severity, source, or release.
5. User exports a CSV or copies a short markdown summary.

MVP metrics:

- Total bugs created in range
- Open bugs
- High/critical open bugs
- New bugs by week
- Closed bugs by week
- Severity distribution
- Status distribution
- Top product areas
- Mean time to triage
- Mean time to close

### Flow 5: Attach Evidence Safely

1. User uploads an image or file while creating or editing a bug.
2. File is stored in a private workspace-scoped bucket path.
3. Bug detail renders a signed URL that expires.
4. Activity timeline records that an attachment was added, but not the signed URL.

## 10. Data Model

Use UUID primary keys, `created_at`, `updated_at`, and `created_by` consistently.

### Tables

```text
profiles
  id uuid primary key references auth.users(id)
  display_name text
  avatar_url text
  created_at timestamptz
  updated_at timestamptz

workspaces
  id uuid primary key
  name text not null
  slug text unique not null
  created_by uuid references profiles(id)
  created_at timestamptz
  updated_at timestamptz

workspace_members
  workspace_id uuid references workspaces(id)
  user_id uuid references profiles(id)
  role text check role in ('owner', 'member')
  created_at timestamptz
  primary key (workspace_id, user_id)

product_areas
  id uuid primary key
  workspace_id uuid references workspaces(id)
  name text not null
  color text
  is_active boolean default true
  created_at timestamptz
  updated_at timestamptz

bugs
  id uuid primary key
  workspace_id uuid references workspaces(id)
  title text not null
  description text
  steps_to_reproduce text
  expected_result text
  actual_result text not null
  severity text not null
  priority text
  status text not null default 'new'
  source text
  environment text
  app_version text
  browser text
  device text
  url text
  product_area_id uuid references product_areas(id)
  reporter_id uuid references profiles(id)
  assignee_id uuid references profiles(id)
  duplicate_of_bug_id uuid references bugs(id)
  first_triaged_at timestamptz
  closed_at timestamptz
  created_by uuid references profiles(id)
  created_at timestamptz
  updated_at timestamptz

labels
  id uuid primary key
  workspace_id uuid references workspaces(id)
  name text not null
  color text
  created_at timestamptz

bug_labels
  bug_id uuid references bugs(id)
  label_id uuid references labels(id)
  primary key (bug_id, label_id)

bug_attachments
  id uuid primary key
  bug_id uuid references bugs(id)
  workspace_id uuid references workspaces(id)
  storage_path text not null
  file_name text not null
  content_type text
  file_size_bytes bigint
  uploaded_by uuid references profiles(id)
  created_at timestamptz

bug_activity
  id uuid primary key
  bug_id uuid references bugs(id)
  workspace_id uuid references workspaces(id)
  actor_id uuid references profiles(id)
  event_type text not null
  field_name text
  old_value text
  new_value text
  metadata jsonb default '{}'
  created_at timestamptz
```

### Enum Values

Severity:

```text
critical
high
medium
low
```

Priority:

```text
p0
p1
p2
p3
```

Status:

```text
new
triaged
needs_info
in_progress
fixed
verified
closed
duplicate
wont_fix
reopened
```

Source:

```text
manual
support
qa
customer
monitoring
import
```

## 11. Supabase Security Model

RLS policy rule of thumb: a user can read or write a row only when they are a member of the row's workspace.

Recommended helper function:

```sql
create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
  );
$$;
```

Every workspace-scoped table should have policies shaped like:

```sql
alter table public.bugs enable row level security;

create policy "members can read bugs"
on public.bugs
for select
to authenticated
using (public.is_workspace_member(workspace_id));

create policy "members can create bugs"
on public.bugs
for insert
to authenticated
with check (public.is_workspace_member(workspace_id));

create policy "members can update bugs"
on public.bugs
for update
to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));
```

Security checklist:

- Enable RLS on all public schema tables that store user data.
- Do not use the service role key in browser code.
- Prefer server actions or route handlers for privileged operations.
- Keep attachments in a private Supabase Storage bucket.
- Generate signed URLs on demand.
- Do not store full request bodies in app logs.
- Collapse cross-workspace access failures into generic 404 or permission errors.
- Add tests that prove user A cannot read user B's workspace rows.

## 12. Vercel And Environment Configuration

Commit `.env.example`:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=example-publishable-key

# Server-only. Do not expose through NEXT_PUBLIC_.
SUPABASE_SERVICE_ROLE_KEY=replace-in-vercel-only
```

Commit `.gitignore` entries:

```gitignore
.env
.env.local
.env.*.local
.vercel
node_modules
.next
coverage
playwright-report
test-results
*.log
```

Vercel environment variable plan:

- Development: local `.env.local` or `vercel env pull`.
- Preview: branch-safe Supabase project or preview-safe credentials.
- Production: production Supabase project only.
- Any environment variable changes require a new deployment before they apply to the running app.

## 13. UI Design Direction

BugBrief should feel calm, precise, and useful under pressure.

Principles:

- Dense but readable dashboard layout.
- Tables and filters over decorative cards.
- Clear status and severity badges.
- Strong empty states with direct actions.
- Mobile capture form first, desktop reporting second.
- Use icon buttons for repeated actions: edit, delete, upload, copy, export, filter.
- Keep card radius at 8px or less unless a component library default requires otherwise.
- Use color as reinforcement, never the only signal.
- Avoid a one-hue palette; severity colors need semantic distinction.

Suggested pages:

- Dashboard: KPI strip, triage queue, recent activity, severity trend.
- Bugs list: search, saved views, filters, sortable table, mobile cards.
- Bug detail: title, status controls, structured fields, attachments, activity timeline.
- Reports: charts, date range, export, markdown summary.
- Settings: product areas, labels, members.

## 14. Reporting Requirements

Reports should be computable from the structured database, not manually written.

Core query dimensions:

- Date range
- Status
- Severity
- Priority
- Product area
- Source
- Environment
- App version
- Assignee
- Reporter

KPI definitions:

```text
Time to triage = first_triaged_at - created_at
Time to close = closed_at - created_at
Open bugs = status not in ('closed', 'duplicate', 'wont_fix')
High severity open bugs = open bugs where severity in ('critical', 'high')
Bug escape by version = bugs grouped by app_version and severity
```

MVP export formats:

- CSV for filtered bug rows.
- Markdown summary for stakeholder updates:

```markdown
## BugBrief Summary

- Range: YYYY-MM-DD to YYYY-MM-DD
- Bugs opened: N
- Bugs closed: N
- Open high/critical: N
- Top affected areas: Area A, Area B, Area C
- Mean time to triage: N hours
- Mean time to close: N days
```

## 15. App Architecture

Recommended structure:

```text
src/
  app/
    (auth)/
    (app)/
    api/
      health/
  components/
    bugs/
    dashboard/
    reports/
    ui/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    validation/
    auth/
    dates/
  server/
    bugs/
    reports/
    workspaces/
  styles/
supabase/
  migrations/
  seed.synthetic.sql
tests/
  e2e/
  unit/
```

Server/client boundary:

- Browser components can use the publishable Supabase key.
- Server components, route handlers, and server actions should use server-side Supabase clients.
- Never expose the service role key to client bundles.
- Use generated TypeScript database types after migrations stabilize.

Health route:

```text
GET /api/health
```

Response should include:

```json
{
  "status": "ok",
  "service": "bugbrief",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "environment": "development",
  "commit": "unknown"
}
```

Do not include secrets, Supabase keys, database URLs, or user counts in public health output.

## 16. Testing Strategy

Unit tests:

- Validation schemas.
- Status transition helpers.
- Reporting aggregations.
- Date range utilities.
- CSV export formatting.

Integration tests:

- Create bug.
- Update bug status.
- Attach file metadata.
- Filter bug list.
- Generate reports.
- RLS-style access checks where practical.

E2E tests:

- Register/sign in.
- Create a bug.
- Triage a bug.
- Upload an attachment using synthetic fixture.
- Search and filter bug list.
- View reports.
- Export CSV.

Security tests:

- Unauthenticated user cannot access app routes.
- User cannot access another workspace's bug detail.
- Service role key is never present in built client output.
- `.env.local` is ignored by git.

## 17. Iteration Plan

### Phase 0: Scoping

- Finalize this document.
- Decide repository license.
- Decide UI component library.
- Confirm whether the MVP is single-workspace-per-user or multi-workspace from day one.

### Phase 1: Project Foundation

- Scaffold Next.js + TypeScript app.
- Add linting, formatting, test runner, Playwright.
- Add `.env.example`, `.gitignore`, README, SECURITY.
- Create Vercel project.
- Create Supabase project.
- Add Supabase local config or migration workflow.

### Phase 2: Auth And Workspace

- Implement Supabase Auth.
- Create profiles, workspaces, workspace_members.
- Add RLS policies and membership helper.
- Add app shell and protected routes.

### Phase 3: Bug Intake

- Implement product areas and labels.
- Implement bug create/edit/detail.
- Add attachments metadata and private storage flow.
- Add activity timeline.

### Phase 4: Triage And List

- Implement dashboard triage queue.
- Implement bug list search, filters, sort, saved query params.
- Add status transition behavior.

### Phase 5: Reports

- Implement KPI cards.
- Implement trend charts.
- Implement CSV export.
- Implement markdown summary copy.

### Phase 6: Hardening

- Add access control tests.
- Add health route.
- Add CI.
- Add Vercel preview deployment checks.
- Review public repo for secrets and proprietary residue.

## 18. Definition Of Done For MVP

- A new user can register, create a workspace, and submit a bug.
- A user can triage, update, close, and reopen bugs.
- A user can attach at least one screenshot or file privately.
- Dashboard shows current triage state.
- Reports page answers "what changed in bug quality this week?"
- RLS is enabled and tested for workspace-scoped tables.
- App deploys on Vercel.
- Supabase credentials are configured through environment variables.
- Public repository contains no proprietary information.
- README has setup instructions that work for a new contributor.

## 19. Open Decisions

- Should MVP support multiple workspaces per user, or create the schema now and expose one workspace in UI?
- Should external anonymous bug intake be in v1 or deferred?
- Should screenshots be image-only, or allow PDFs/log snippets?
- Should "severity" and "priority" both exist in MVP?
- Which chart library should be standardized?
- Should demo mode be a seeded local-only script or a hosted demo workspace?
- What license should the public repository use?

## 20. Build Prompt For A Coding Agent

Use this after Phase 0 decisions are answered:

```text
Build BugBrief as a public-repo-safe Next.js App Router application deployed to Vercel with Supabase Auth, Postgres, Storage, and RLS.

Use BUGBRIEF-0-TO-1-SCOPE.md as the product source of truth. Do not add proprietary examples, private URLs, real customer names, real screenshots, logs, or secrets. Commit `.env.example`, not `.env.local`.

Start with project scaffolding, Supabase schema migrations, protected app shell, auth, default workspace creation, and the bug create/list/detail flow. Keep code modular, typed, tested, and ready for public contributors.
```

## 21. Reference Notes

These are implementation references, not proprietary app content:

- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase server-side Next.js client setup: https://supabase.com/docs/guides/auth/server-side/nextjs
- Vercel environment variables: https://vercel.com/docs/environment-variables
