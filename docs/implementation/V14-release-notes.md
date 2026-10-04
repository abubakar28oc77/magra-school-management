# V14 Release Notes — AI Education & Learning Analytics

## Added
- AI Tutor conversation storage with per-user ownership checks.
- Bangla-first tutor response foundation with topic-aware study guidance.
- Student learning insights from attendance and result marks.
- Weak-subject detection and actionable study tips.
- Personalized study-plan generation foundation using current performance data.
- Student portal-compatible AI APIs and admin AI panel.
- AI safety notice: assistant is educational support, not a teacher replacement.
- Official school monogram refreshed from the latest supplied image.

## Verification
- Backend `node --check` passed.
- Migration syntax/structure reviewed.
- Frontend source route/component presence checked.
- Full browser production build remains environment-dependent until dependencies can be installed in a network-enabled deployment environment.

## Important
The V14 tutor is an AI-education foundation with a deterministic local response layer. A production LLM provider should be connected later through server-side secrets; no API key is embedded in the frontend.
