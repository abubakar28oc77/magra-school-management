# V10 Release Notes — Finance & Library

## Verification before V10
- V9 backend JavaScript syntax checked with `node --check`.
- V9 migration and route structure inspected.
- Frontend dependency install/build was attempted but the environment timed out, so a full production bundle could not be certified here.
- V9 result processing was tightened so a subject below its configured pass mark becomes F; marks are also validated against written/MCQ/practical component limits.

## Added
- Finance: fee invoices, payment history, due/paid summary, expenses.
- Library: book catalog, available stock, issue/return workflow, fine field.
- Role restrictions for finance and library write operations.
- Transactional payment and book issue/return operations.
- Migration: `database/migrations/010_finance_library.sql`.
- Responsive admin panels for Finance and Library.

## Important
Database migrations must be applied before using V10 APIs. Configure PostgreSQL and environment variables before deployment. This release is a development milestone, not a production certification.
