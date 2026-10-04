# V20 End-to-End Checklist

1. Apply all database migrations in order: 001-016.
2. Verify seed/admin account and password policy.
3. Test login, invalid login, token expiry, logout/client token removal.
4. Test role assignment/revocation and audit log creation.
5. Test students, teachers, staff CRUD/search.
6. Test admission application -> admission -> student conversion.
7. Test daily attendance and attendance alerts.
8. Test exam setup -> marks entry -> result processing -> marksheet/tabulation.
9. Test fees, payments, expenses, receipts/reports.
10. Test library inventory, issue, return, fine.
11. Test student/teacher/guardian portals and access isolation.
12. Test learning content, question bank, assignments, online exams.
13. Test AI conversation ownership and study plans.
14. Test notices, notifications, broadcast and read state.
15. Test document preview/issue/print.
16. Test reports and risk analytics.
17. Test PWA install, offline shell, responsive layouts.
18. Test backup creation, checksum verification, retention and restore on a disposable database.
19. Run frontend production build.
20. Run smoke tests from a clean browser session.
