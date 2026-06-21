# BugBrief

BugBrief is a 0-to-1 bug reporting and bug intelligence app concept. The goal is to help small teams capture high-quality bug reports, triage them, and report on quality trends.

This repository is public by design. Do not commit proprietary data, real customer examples, production logs, screenshots with private information, or secrets.

## Current Status

Design and scoping.

Start here:

- [0 to 1 Product Scope](./BUGBRIEF-0-TO-1-SCOPE.md)

## Intended Stack

- Next.js App Router and TypeScript
- Supabase Auth, Postgres, Storage, and Row Level Security
- Vercel hosting

## Public Repo Safety

- Commit `.env.example`, never `.env` or `.env.local`.
- Use synthetic demo data only.
- Keep Supabase service role keys server-side and out of source control.
- Enable Row Level Security before writing user data to Supabase tables.
