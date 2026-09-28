# ContextFlow CRM

**Remember the relationship, not just the contact.**

ContextFlow is an AI-native mini CRM that turns relationship context into explainable next actions.

## Current capabilities

- Supabase authentication with assessment demo mode
- Contact CRUD and search
- Relationship notes and interaction timeline
- Deal pipeline with drag/drop stage management
- Server-side validated REST route handlers
- Supabase PostgreSQL with Row Level Security
- Contextual AI follow-up drafts with deterministic fallback
- Explainable relationship intelligence:
  - 0–100 health score
  - healthy / watch / at-risk status
  - positive / neutral / negative momentum
  - evidence-backed risks and signals
  - concrete next actions
- AI account briefing:
  - portfolio-level pipeline metrics
  - attention-needed relationships
  - prioritized relationship triage
  - evidence-based account recommendations
- Proactive AI alerts for stale relationships, low-health deals and qualified milestones
- Grounded CRM Copilot for pipeline, priority, action and contact questions
- Dashboard integration of relationship scores, triage and Copilot answers

## Architecture

```text
Browser
  -> Next.js / Vercel
      -> Route Handlers
          -> Supabase Auth + PostgreSQL
          -> Relationship Intelligence
          -> Account Briefing / Triage
          -> Proactive Alerts
          -> Grounded CRM Copilot
          -> Gemini API (server-side, optional)
```

## Key API routes

- `GET /api/health`
- `GET/POST /api/v1/contacts`
- `GET/PATCH/DELETE /api/v1/contacts/:id`
- `POST /api/v1/contacts/:id/activities`
- `GET/POST /api/v1/deals`
- `PATCH /api/v1/deals/:id`
- `POST /api/v1/ai/follow-up`
- `POST /api/v1/ai/next-action`
- `POST /api/v1/ai/relationship-summary`
- `GET /api/v1/ai/account-briefing`
- `GET /api/v1/ai/alerts`
- `POST /api/v1/ai/copilot`

The account briefing is deterministic and explainable; it does not pretend that an opaque model prediction is a fact.

## Verification

GitHub Actions validates dependency installation, linting, tests and the production build.

Run locally:

```bash
npm ci
npm run lint
npm test
npm run build
```

## Deployment

The target stack is Vercel + Supabase + optional Gemini. Keep Gemini credentials server-side and use Supabase RLS for tenant isolation.

See the existing production checklist in this repository for environment configuration and smoke tests.
