# V118 Engineering Release Notes

V118 is a **pilot execution package**, not a production deployment.

## Added
- Windows PowerShell one-command preflight for backend/frontend dependency installation and build.
- Explicit Pilot Start Here guide.
- Existing V117 acceptance, security, backup/restore, migration and pilot safeguards retained.

## Verified in this environment
- V117 static acceptance: 17/17 PASS.
- Security audit: 13/13 PASS.
- Backend syntax: PASS.
- Shell syntax: PASS.

## Environment-dependent gate
Frontend production build remains unverified here because frontend dependencies are not installed in this execution environment. V118 provides a reproducible PowerShell path to run `npm ci` and `npm run build` on a machine with package installation access.

## Next gate
Disposable Pilot PostgreSQL/Supabase → migrations → synthetic seed → live verification → browser/mobile acceptance → backup/restore → production preflight.
