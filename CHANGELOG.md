# Changelog

All notable public-safe changes to BugBrief are tracked here.

## Unreleased

- Bootstrapped the Next.js, TypeScript, and Tailwind application shell.
- Added synthetic issue data for local dashboard development.
- Added configurable P0/P1/P2 SLA calculation logic and report shaping.
- Added dashboard charts for influx, SLA outcomes, time-to-fix, and escaped vs unescaped issue mix.
- Added REST demo endpoints for issues, SLA reporting, aging, time-to-fix, health, and OpenAPI discovery.
- Added a Supabase migration draft with workspace tables, SLA policies, issues, API keys, audit logs, and RLS policies.
- Added unit tests for SLA and reporting behavior.
- Added persistent app navigation with Dashboard, Issues, Reports, Settings, and API links.
- Added initial Issues, Reports, and Settings pages backed by synthetic data.
- Fixed review findings around workspace-local P0 SLA boundaries, resolved-status imports without timestamps, high-priority average time-to-fix labeling, breached-state iconography, and server-only Supabase service client protection.
- Added local Supabase/Postgres configuration, synthetic seed data, and a repository boundary for demo vs Supabase data sources.
- Added the Supabase CLI as a dev dependency plus a db:env helper for reproducible local database setup.
- Added explicit Supabase API role grants so local service-role reads can access seeded tables.
