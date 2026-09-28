# Changelog

## Unreleased

### Phase 6 — AI Relationship Intelligence

- Added a deterministic relationship-intelligence engine.
- Added 0–100 relationship health scoring based on engagement recency, deal stage, deal health and recorded relationship context.
- Added relationship status: healthy, watch, or at-risk.
- Added momentum classification: positive, neutral, or negative.
- Added explainable signals and risks instead of opaque scoring.
- Added concrete next-action recommendations.
- Added authenticated `POST /api/v1/ai/relationship-summary`.
- Added unit coverage for healthy, stale and missing-context scenarios.
- Updated deployment/demo documentation.

The score is an application signal, not a claim about a person's intent or likelihood to buy.
