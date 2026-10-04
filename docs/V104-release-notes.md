# V105 — Finalization Pass

- Added secure bulk student CSV import (up to 500 rows per request) for authorized school managers.
- Added downloadable student CSV template in Student Management.
- Existing individual student create/edit workflow retained.
- Added pilot cleanup script so synthetic PILOT-* students/users/test records can be removed before production use.
- Pilot data remains synthetic and isolated; production must never run pilot setup/cleanup.
- `/health`, `/ready`, and startup labels advanced to V105.
