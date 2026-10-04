# V101 — Profile → Login Account

## Added
- Direct account provisioning from existing Student, Teacher and Staff profiles.
- Transactional account creation + profile linking.
- Role is fixed by profile type: student / teacher / staff.
- Existing linked profiles cannot receive a second account.
- Unique partial indexes enforce one-to-one profile/user links.
- Admin navigation: Security → ইউজার ও রোল → Profile → Login.
- Temporary password is required (8+); first login remains forced to change password.

## Verification
- V101 QA: 12/12 PASS
- Backend syntax: PASS
- Full Vite production build: not certified in this environment.
- Live Supabase/PostgreSQL integration: not certified in this environment.
