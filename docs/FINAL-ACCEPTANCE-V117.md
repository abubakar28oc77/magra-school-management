# Magra School Management ERP — V117 Final Acceptance Pack

## 1. বর্তমান অবস্থা

V117 হলো **Final Candidate**। Static QA ও security audit সম্পন্ন হয়েছে। Live Supabase/PostgreSQL connectivity এখনও এই package-এর মধ্যে দাবি করা হচ্ছে না।

### ইতোমধ্যে যাচাই
- Migration chain: 006–037
- Dynamic public contact: ৪টি role
- Dynamic student statistics
- Education clubs: ৪টি
- Emergency services interface: ৬টি নম্বর
- Student CSV import/update
- Teacher CSV import
- Staff CSV import
- Student/teacher/staff pagination
- Attendance roster pagination
- Scale-oriented database indexes
- bcrypt/JWT/session invalidation/audit/rate limiting/CORS/Helmet
- Backend syntax check

## 2. Pilot acceptance — ব্যবহারিক ধাপ

### A. Database
1. Supabase project-এ schema/migrations 006–037 apply করতে হবে।
2. Pilot seed ব্যবহার করে ছোট dataset তৈরি করতে হবে।
3. `DATABASE_URL` এবং প্রয়োজন হলে `PILOT_DB_SSL=true` সেট করতে হবে।
4. `scripts/pilot_verify.mjs` চালাতে হবে।

Expected: `PILOT VERIFY: ... PASS` এবং production environment-এ script চলবে না।

### B. Login & security
- EIIN/login credential দিয়ে login
- ভুল password reject
- inactive user reject
- logout-এর পর token invalid
- password change-এর পর relogin required
- admin reset-এর পর পুরনো session invalid
- role অনুযায়ী restricted API reject

### C. Student management
- নতুন student manual entry
- edit
- inactive/transfer/dropout status
- Student ID duplicate হলে update/import behaviour যাচাই
- CSV template download
- CSV import 1–500 rows
- invalid required fields row-level error
- class ৬–১০ validation
- CSV report/export

### D. Teacher & staff
- manual add/edit
- status inactive/retired/former
- CSV template/import
- duplicate Employee ID upsert behaviour
- public contact checkbox/role

### E. Public website
- Home page dynamic statistics
- Contact menu → Head Teacher / Assistant Head Teacher / ICT Teacher / Office Assistant
- active profile পরিবর্তন করলে public contact পরিবর্তন
- inactive/retired profile public contact থেকে বাদ
- ৪টি club section
- ৬টি emergency service tap-to-call link

### F. Academic operations
- attendance roster + bulk attendance
- exam/marks/result
- routine
- assignments/learning
- admission
- notices/notifications

### G. Finance & services
- fees/payment
- expense
- library
- transport
- hostel

## 3. Backup / restore acceptance

Backup command:

```bash
DATABASE_URL="..." BACKUP_DIR="./backups" ./scripts/backup.sh
```

Backup package তৈরি হলে `.dump` এবং `.dump.sha256`—দুইটি file থাকতে হবে।

Restore test শুধুমাত্র disposable pilot database-এ:

```bash
DATABASE_URL="..." ./scripts/restore.sh ./backups/magra_school_YYYYMMDDTHHMMSSZ.dump
```

Restore-এর পরে `scripts/pilot_verify.mjs` পুনরায় চালিয়ে data integrity যাচাই করতে হবে। Production database-এ restore test সরাসরি চালানো যাবে না।

## 4. Scale acceptance target

Current school size প্রায় ৬০০ student হলেও test target হবে:
- ৬০০+ students
- ৩০+ teachers/staff combined
- multiple sections
- multiple academic years
- attendance history
- marks history
- fees/payment history

বিশেষভাবে verify করতে হবে যে list screens সব record একসাথে অযথা load না করে pagination ব্যবহার করছে।

## 5. Production handoff gate

নিচের সবগুলো PASS না হওয়া পর্যন্ত `magrapalshs.edu.bd`-এর production deployment final ধরা হবে না:

- [ ] Pilot DB migration PASS
- [ ] Pilot seed/verification PASS
- [ ] Login/security PASS
- [ ] Student CRUD PASS
- [ ] Student CSV import/update PASS
- [ ] Teacher CRUD/import PASS
- [ ] Staff CRUD/import PASS
- [ ] Attendance PASS
- [ ] Result/marks PASS
- [ ] Finance PASS
- [ ] Public page/contact/stats PASS
- [ ] Backup PASS
- [ ] Restore-on-disposable-DB PASS
- [ ] Browser/mobile UI acceptance PASS
- [ ] Production environment variables configured
- [ ] HTTPS/domain configured
- [ ] Final production backup policy configured

## 6. Important boundary

V117 package-টি production-ready architecture এবং pilot acceptance-এর জন্য প্রস্তুত। কিন্তু **live database credentials ছাড়া live database connectivity, real hosting, domain, SSL বা production deployment সম্পন্ন হয়েছে—এমন দাবি করা যাবে না।**
