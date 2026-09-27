# ContextFlow CRM

ContextFlow is an AI-native mini CRM for the Project 5 assessment.

The product idea is simple: a CRM should preserve relationship context and help the user decide what to do next, not only store contacts and stages.

## MVP

- Dashboard with leads, qualified, won, and pipeline metrics
- Contact search and relationship detail view
- Deal Kanban with New, Contacted, Qualified, Won, and Lost
- Deal-health signal and stale-deal attention flag
- AI follow-up copilot with rationale and next action
- REST endpoints with Zod validation and structured errors
- Demo-mode login for reliable assessment playback
- GitHub Actions validation on every push and pull request

## Stack

Next.js App Router, React, Tailwind CSS, TypeScript, Zod, Gemini API, and Vercel as the target runtime. Supabase is prepared as the production persistence and authentication layer through the isolated cf_ schema in supabase/schema.sql.

## Run

Install dependencies, copy .env.example to .env.local, and run the development server. Demo mode works without API keys. The demo credentials are shown on the login screen.

## Security decisions

LLM output is a draft only and is never sent automatically. Deterministic deal-health rules are used for business signals. API inputs are validated before mutation. The production Supabase design uses owner-based RLS and never exposes a service-role key to the browser.

## Architecture

Browser -> Vercel / Next.js -> REST Route Handlers -> Supabase PostgreSQL + Auth; AI generation calls Gemini from the server side.

## More time

Complete the Supabase-backed repository adapter for every endpoint, add real sign-up and password reset, use true drag-and-drop with optimistic persistence, add end-to-end browser tests, and add a compact activity-insights admin view.
