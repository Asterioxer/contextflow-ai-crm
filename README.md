# ContextFlow CRM

**Remember the relationship, not just the contact.**

ContextFlow is an AI-native mini CRM for the Project 5 assessment. Instead of behaving like a contact spreadsheet, it turns relationship context into a usable next action.

## Requirements coverage

| Requirement | Status |
| --- | --- |
| Authentication | ✅ Supabase email/password + assessment demo mode |
| Contact CRUD + search | ✅ |
| Relationship notes/context | ✅ |
| Deal pipeline | ✅ New → Contacted → Qualified → Won/Lost |
| Drag-and-drop Kanban | ✅ Native HTML5 drag/drop + keyboard selector |
| REST API | ✅ Route Handlers with validation and structured errors |
| PostgreSQL | ✅ Supabase `cf_` schema with RLS |
| AI follow-up email | ✅ Gemini-backed, with deterministic fallback |
| Relationship intelligence | ✅ Deterministic health, momentum, risk and next-action analysis |

## Product differentiators

- Relationship memory: contact notes and interaction timeline are first-class data
- Relationship intelligence: a measurable 0–100 score combines engagement, deal stage, deal health and recency
- Next-best-action reasoning is deterministic and explainable
- AI drafts are human-in-the-loop; the application never sends an email automatically
- AI generation is auditable when Supabase persistence is enabled
- CRM text is treated as untrusted data inside the AI prompt to reduce prompt-injection risk

## Stack — target cost: $0

Next.js App Router, React 19, Tailwind CSS, TypeScript, Supabase Free, Gemini API free tier, and Vercel Hobby. See the [Vercel pricing](https://vercel.com/pricing), [Supabase pricing](https://supabase.com/pricing), and [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) pages for current limits and policies.

Gemini 3.5 Flash-Lite is the default model for the free-tier target configuration.

## Local setup

1. Copy `.env.example` to `.env.local`
2. For assessment playback, keep `DEMO_MODE=true` and `NEXT_PUBLIC_DEMO_MODE=true`
3. For live auth/data, set `DEMO_MODE=false`, `NEXT_PUBLIC_DEMO_MODE=false`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Apply `supabase/schema.sql` in the target Supabase project
5. Add the target production URL to Supabase Auth redirect URLs when enabling password recovery
6. Add `GEMINI_API_KEY` to enable live AI; no key is required for deterministic demo generation
7. Run `npm install` and `npm run dev`

## Production checklist

- Import this GitHub repository into a Vercel Hobby project
- Configure the environment variables from `.env.example` for Production and Preview as appropriate
- Keep `DEMO_MODE=false` and `NEXT_PUBLIC_DEMO_MODE=false` in live environments
- Apply `supabase/schema.sql` once to the dedicated ContextFlow database
- Verify `/api/health` returns `status: ok`
- Verify signup, sign-in, sign-out, password recovery, contact CRUD, deal drag/drop, activity logging, AI draft generation, and relationship intelligence
- Keep `GEMINI_API_KEY` server-side; never expose it through `NEXT_PUBLIC_*`
- Rotate keys if they are ever committed or exposed

## Security

Supabase SSR follows the current Next.js proxy/session pattern and uses `getClaims()` for protected server-side checks. Browser code receives only the publishable key. Every ContextFlow table has Row Level Security scoped to the authenticated owner. API inputs are validated with Zod. Security headers are set in `next.config.ts`. See `SECURITY.md` for the threat model and operational controls.

## Architecture

```text
Browser
  -> Next.js / Vercel
      -> Route Handlers
          -> Supabase Auth + PostgreSQL
          -> Relationship Intelligence
          -> Gemini API (server-side, optional)
```

## Key routes

- `/login` — sign-in/sign-up/demo access
- `/forgot-password` — live Supabase password recovery
- `/auth/update-password` — secure password reset target
- `/dashboard` — CRM workspace
- `GET /api/health` — deployment health signal
- `GET/POST /api/v1/contacts` — list/create contacts
- `GET/PATCH/DELETE /api/v1/contacts/:id` — contact management
- `POST /api/v1/contacts/:id/activities` — interaction logging
- `GET/POST /api/v1/deals` — deal listing/creation
- `PATCH /api/v1/deals/:id` — stage/value updates
- `POST /api/v1/ai/follow-up` — contextual draft generation
- `POST /api/v1/ai/next-action` — deterministic next-action analysis
- `POST /api/v1/ai/relationship-summary` — relationship health, momentum, risks, signals and next actions

## Demo story

Open the dashboard, inspect a relationship, edit its notes, log an interaction, create or move a deal, generate a follow-up, and inspect relationship intelligence. The product moment is that the system can explain **why** a relationship needs attention instead of presenting an unexplained AI score.

## Verified engineering state

The repository uses GitHub Actions to run dependency installation, lint, tests, and a production build. Phase 6 adds pure unit coverage for healthy, stale and missing-context relationship scenarios.
