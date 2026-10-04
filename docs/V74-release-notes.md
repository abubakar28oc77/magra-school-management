# V74 Release Notes

## Focus
Production-readiness hardening without changing the locked public View Page (reference 1→2→3→4).

## Changes
- Corrected runtime health/readiness/startup version labels from stale V72 to V74.
- Added `scripts/preflight_v74.mjs` for production configuration and middleware checks.
- Added `scripts/security_audit_v74.mjs` for repeatable security regression checks.
- Retained all V73 user/role/password-reset, official document, portal, result, learning, AI, finance, library, transport and hostel functionality.

## Certification status
- Static preflight: PASS.
- Security static audit: PASS.
- Live PostgreSQL integration: not certified in this environment.
- Full Vite production build: not certified because frontend dependencies are not installed/cached here.
- Production deployment/domain: intentionally not performed before final UI review and user approval.
