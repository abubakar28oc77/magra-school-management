# V56 Release Notes

## Focus
Final integration hardening and frontend/backend API contract verification.

## Changes
- Added the missing `/api/learning` GET/POST endpoints backed by `learning_contents`.
- Added role-aware creation permissions for digital learning content.
- Added audit logging for learning-content creation.
- Added `scripts/qa_v56.mjs` to verify migration continuity, core security/workflows, and static frontend API-path coverage against backend routes.

## Verification
- Backend syntax check: PASS
- V56 Integration QA: 18/18 PASS
- Frontend static API contract: 68 paths checked, 0 unresolved
- Backup script syntax: PASS
- Restore script syntax: PASS

## Known environment limitations
- No live PostgreSQL instance was available in this workspace, so database integration was not executed against a running server.
- Frontend dependencies were not installed in this workspace, so a Vite production build was not certified.
- Production deployment remains intentionally deferred until final UI review and production credentials/domain are available.
