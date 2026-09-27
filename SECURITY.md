# Security Runbook

## Secrets

Keep GEMINI_API_KEY and any Supabase secret credentials out of the repository. Only NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belong in browser-visible configuration.

## Authentication

Live mode uses Supabase Auth with server-side session checks through Next.js proxy.ts. Demo mode is isolated behind the cf_demo httpOnly cookie and exists only for assessment playback.

## Authorization

Every production ContextFlow table has Row Level Security. Policies scope access by auth.uid() = owner_id. Deal creation verifies that its contact is visible to the authenticated user.

## AI safety

CRM fields are treated as untrusted data and are delimited before being passed to the model. The model is instructed not to execute instructions embedded in notes. Responses are schema-validated. Failures fall back to deterministic drafting. AI output is a draft and is never automatically emailed.

## Application hardening

The app sets frame, content-type, referrer, permissions, and HSTS headers. User-data API routes are dynamic and are not intended to be cached.

## Operational checks

- Supabase schema is applied to the dedicated project
- Supabase security/performance advisors report no unresolved high-risk issues
- /api/health returns status ok
- Authentication, CRUD, deal movement, activity logging, password recovery, and AI draft generation work
- Environment variables are set separately for production and preview
- Gemini usage remains within the chosen free-tier quota