# V100 Release Notes

## Account Identity & Linking
- Added Admin > ইউজার ও রোল > Student/Guardian Link.
- Added guardian account to student profile linking with relationship type.
- Added student account to student profile linking.
- Added guardian-link listing endpoint and management view.
- Backend validates that guardian links use active `guardian` accounts and student profile links use active `student` accounts.
- Existing RBAC and audit logging are retained.

## Validation
- Backend syntax: PASS
- V100 QA: 12/12 PASS
- Live PostgreSQL/Supabase: not certified in this build.
- Full Vite production build: not certified in this build.
