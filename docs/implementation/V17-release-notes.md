# V17 Release Notes — Notifications & Communication

Implemented an in-app notification and communication foundation.

- Per-user notifications with read/unread state
- Broadcast notifications to active students, guardians, teachers, staff, or all users
- Admin recipient picker
- Priority and notification type
- Communication message audit trail
- Attendance alert workflow for guardians linked by phone/user account
- Notification preferences schema for future email/SMS/push channels
- Role-restricted sending endpoints
- Transactional broadcast/send operations and audit logging

Production email/SMS/push providers are intentionally not hard-coded; they can be connected later through server-side environment configuration.
