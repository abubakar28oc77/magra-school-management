# V71 — Functional Completion & Document Workflow Fixes

## Completed
- Upgraded API health/readiness/startup identifiers to V71.
- Kept the locked final public View Page reference sequence 1 → 2 → 3 → 4 unchanged.
- Fixed Admit Card generation so an exam must be selected and published exam details are returned.
- Fixed Tabulation Sheet and Merit List generation to support direct class selection instead of requiring an arbitrary student.
- Added a dedicated printable Admit Card template instead of falling through to the tabulation/merit template.
- Improved the Document Generator UI with context-sensitive student/class/exam selectors.
- Retained Student, Guardian and Teacher portal workflows, including learning, online exam, attendance, marks entry and assignment evaluation.

## Verification
- `node --check backend/src/server.js`: PASS
- `node scripts/qa_v71.mjs`: PASS
- Previous V70 public-view QA remains available as historical regression documentation.

## Still not production-certified
- Full Vite production build requires installing frontend dependencies; no claim of live build certification is made here.
- Live PostgreSQL migration/API integration testing is still pending.
- Production hosting/domain/deployment is intentionally not started until the full software and final UI review are completed, per the project workflow.
- Authentication still uses the existing JWT/localStorage architecture; a production hardening pass should migrate to secure httpOnly cookies/refresh-token rotation before deployment.
