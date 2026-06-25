# Local Database

BugBrief supports two local data modes:

```text
BUGBRIEF_DATA_SOURCE=demo      # default, no database required
BUGBRIEF_DATA_SOURCE=supabase  # local Supabase/Postgres
```

Use `demo` when you want the fastest app loop. Use `supabase` when you want to test migrations, Postgres data shape, Supabase API access, and the path toward hosted Supabase.

## Why Local Supabase/Postgres

Local database testing is recommended for this project. It is not a security problem by itself. The security boundary is what gets committed:

Safe to commit:

- Supabase migrations
- RLS policies
- synthetic seed data
- `.env.example`
- local setup docs

Never commit:

- `.env.local`
- real Supabase keys
- Jira API tokens
- exported Jira payloads
- customer or proprietary issue data
- production URLs or logs

## Requirements

- Docker Desktop running
- Node/npm dependencies installed

`npm install` installs the project-pinned Supabase CLI dev dependency. No global Supabase install is required.

Check local tooling:

```powershell
docker --version
npx supabase --version
```

## Start Local Supabase

From the repo root:

```powershell
npm run db:start
```

Supabase will start local services using `supabase/config.toml`. Useful default URLs:

```text
API:        http://127.0.0.1:54321
Studio:     http://127.0.0.1:54323
Postgres:   postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## Reset And Seed

Reset applies migrations and then runs `supabase/seed.sql`:

```powershell
npm run db:reset
```

The seed contains synthetic BugBrief data only.

## Run The App Against Local Supabase

Copy the example env file:

```powershell
Copy-Item .env.example .env.local
```

Then print local Supabase env values:

```powershell
npm run db:env
```

Set these values in `.env.local`:

```text
BUGBRIEF_DATA_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key from npm run db:env>
SUPABASE_SERVICE_ROLE_KEY=<local service role key from npm run db:env>
```

Start the app:

```powershell
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

The dashboard and `/issues` page should show `Local Supabase` as the current source.

## Stop Local Supabase

```powershell
npm run db:stop
```

## Current Limitation

The app uses the server-side Supabase service key for local read access in `BUGBRIEF_DATA_SOURCE=supabase` mode. That is acceptable for this early local-development slice, but the next persistence/auth slice should move user-facing reads and writes through authenticated workspace membership and RLS-backed policies.
