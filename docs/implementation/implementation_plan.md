# Implementation Plan — Magra Pals Union High School Management System

## Goal
Build a production-ready web/PWA school management platform for classes 6–10 with Bangla + English UI, PostgreSQL persistence, secure RBAC, digital learning, configurable examination/result processing, and optional AI education.

## Architecture
- `frontend/`: React + Vite + PWA
- `backend/`: Node.js + Express REST API
- `database/`: PostgreSQL schema + migrations/seeds
- `docs/`: requirements, plan, progress, QA
- `.agents/rules/`: Antigravity workspace rules
- `frontend/public/school-logo.png`: official school logo

## Roles
Super Admin, Admin, Head Teacher, Assistant Head Teacher, Teacher, Accountant, Librarian, Student, Guardian, Staff.

## Public website
Home, school profile, messages, teachers/staff, students, notices, admission information, results, clubs, sports/culture, gallery, achievements, library information, curriculum, textbook list, important links, contact and search.

## Milestones
### 1. Identity & Security
Auth/login/logout, password change/reset foundation, RBAC, permissions, audit logs, activation/deactivation.
### 2. Student & Staff
Student CRUD/profile/photo/guardian/class/section/roll; teacher/staff CRUD; user linkage; ID card data.
### 3. Attendance
Daily/class/teacher attendance, present/absent/late/leave, monthly/class reports, continuous absence, notification integration point.
### 4. Admission
Online application, review, admission test, merit/waiting list, payment status, enrollment conversion.
### 5. Examination & Results
Academic year/class/section/subject, exam setup, configurable mark components, marks entry/import, validation/approval, grade/GPA, merit/pass/fail, tabulation, marksheet, progress report, PDF/print, analytics, versioned grading policies.
### 6. Finance & Library
Fee heads, invoices, payments, dues, receipts, income/expense; books, members, issue/return/fine/stock.
### 7. Portals
Student, Guardian, Teacher and Admin portals; notifications/messaging.
### 8. Digital Learning
Syllabus/chapter/topic, PDF/video/notes, MCQ/CQ, assignments, question bank, online quiz/exam, practice/mock tests, progress.
### 9. AI Education
AI tutor, explanation/practice generation, wrong-answer analysis, weak-topic detection, study plan/revision, teacher assistance, permissions/audit.
### 10. Production
PWA, Android/iOS packaging readiness, security hardening, backup/restore, logging/monitoring, performance, deployment docs.

## Database
Major entities: users, roles, permissions, role_permissions, students, guardians, teachers, staff, classes, sections, subjects, academic_years, enrollments, attendance, exams, exam_subjects, grading_policies, marks, result_summaries, admissions, fee_heads, invoices, payments, books, library_transactions, notices, routines, assignments, question_bank, online_exams, learning_materials, notifications, audit_logs.

## API convention
`/api/auth/*`, `/api/users/*`, `/api/students/*`, `/api/teachers/*`, `/api/admissions/*`, `/api/attendance/*`, `/api/exams/*`, `/api/results/*`, `/api/fees/*`, `/api/library/*`, `/api/notices/*`, `/api/learning/*`, `/api/ai/*`, `/api/reports/*`.

Use consistent JSON errors, validation, authorization, and never return password hashes.

## Verification
For every milestone: database migration/seed check; backend tests/lint; frontend build; critical API checks; role restriction checks; responsive UI check; update `progress.md`.

## Acceptance
The project is complete only when major modules work end-to-end with real PostgreSQL persistence, role restrictions, validation, audit logging, error handling, responsive UI, backup/restore documentation, and a tested production build.
