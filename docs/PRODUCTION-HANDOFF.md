# Production Handoff Checklist

This package is a final production candidate (V104 hardening), not a live deployment.

## Before launch

1. Provision a PostgreSQL database.
2. Set `DATABASE_URL` in the backend environment.
3. Set a unique `JWT_SECRET` of at least 32 characters.
4. Set explicit HTTPS `CORS_ORIGIN` values for the deployed frontend.
5. Run the baseline schema, then all migrations in numeric order from 006 through 035.
6. Create the first Super Admin account using the approved secure bootstrap procedure.
7. Install frontend dependencies and run `npm run build` in the frontend directory.
8. Serve the generated `dist/` directory over HTTPS.
9. Start the Node.js backend with the production environment.
10. Verify `/health` and `/ready` before opening the site to users.
11. Test login, password reset, RBAC, session invalidation, attendance, results, documents, backup/restore and portals with test data.
12. Only after acceptance, import real school data and configure the renewed school domain.

## Important

Do not put real student data into a development database. Take a verified backup before every production migration. Keep production secrets outside source control.
