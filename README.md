# ContextFlow CRM

**Remember the relationship, not just the contact.**

ContextFlow is an AI-native mini CRM for the Project 5 assessment. Instead of behaving like a contact spreadsheet, it turns relationship context into a usable next action.

## What is implemented

- Authentication with Supabase Auth in live mode, with deterministic demo mode for reliable assessment playback
- Contact CRUD with search
- Relationship profile with notes and interaction timeline
- Deal pipeline with New, Contacted, Qualified, Won, and Lost stages
- Native HTML5 drag-and-drop Kanban movement with keyboard-accessible stage selectors
- Deterministic deal-health/stale attention signals
- Context-aware AI follow-up drafts with rationale and next action
- AI generation audit records when Supabase persistence is enabled
- REST APIs with Zod validation and structured errors
- Owner-scoped persistence using Supabase RLS
- GitHub Actions validation on every push and pull request

## Stack

Next.js App Router, React 19, Tailwind CSS, TypeScript, Zod, Supabase Auth/Postgres, Gemini API, and Vercel as the target runtime. The database uses isolated `cf_` tables so ContextFlow does not need to own unrelated application data.

## Local setup

1. Copy `.env.example` to `.env.local`
2. For assessment playback, keep `DEMO_MODE=true` and `NEXT_PUBLIC_DEMO_MODE=true`
3. For live Supabase auth/data, set `DEMO_MODE=false`, `NEXT_PUBLIC_DEMO_MODE=false`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Apply `supabase/schema.sql` to the Supabase SQL editor
5. Run `npm install` and `npm run dev`

The demo credentials are shown on the login screen. No Gemini key is required for the deterministic fallback. Add `GEMINI_API_KEY` to enable live generation.

## Security decisions

Supabase sessions use the Next.js 16 `proxy.ts` flow and server-side `getClaims()`. Browser code only uses the publishable key. Row Level Security scopes every ContextFlow table to `auth.uid() = owner_id`. The AI is draft-only and never sends an email automatically. Input payloads are validated before mutations.

## Architecture

```text
Browser
  -> Next.js / Vercel
      -> Route Handlers
          -> Supabase Auth + PostgreSQL
          -> Gemini API (server-side, optional)
```

## Project structure

- `src/app` — Next.js pages and REST route handlers
- `src/lib/repository.ts` — persistence abstraction with demo fallback
- `src/lib/supabase` — browser/server/proxy Supabase clients
- `supabase/schema.sql` — RLS-protected ContextFlow database schema
- `tests/` — core deterministic checks

## Demo story

Open the dashboard, inspect a relationship, edit its notes, move a deal between stages, and generate a follow-up. The key product moment is that the AI draft is grounded in relationship memory and current deal context rather than a generic email prompt.