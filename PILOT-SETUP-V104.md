# মগড়া পালস্‌ ইউনিয়ন উচ্চ বিদ্যালয় — V104 Pilot Setup

## বর্তমান অবস্থা
- Application release: **V104**
- Static final-readiness audit: **21/21 PASS**
- Security audit: **13/13 PASS**
- V104 regression/hardening QA: **6/6 PASS**
- Database connection: **এখনও চালানো হয়নি** — pilot database-এর connection string প্রয়োজন।
- Production domain/hosting: **এখনও প্রয়োজন নেই**।

## Pilot database
Pilot setup শুধুমাত্র temporary/test PostgreSQL database-এর জন্য। Production database-এ `NODE_ENV=production` রেখে এই script চালানো যাবে না।

### 1. Backend dependencies
`backend` folder-এ গিয়ে:

```bash
npm install
```

### 2. Environment file
`backend/.env.pilot.example` কপি করে `.env` তৈরি করুন এবং এই মানগুলো দিন:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=YOUR_TEMPORARY_POSTGRES_CONNECTION_STRING
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
CORS_ORIGIN=http://localhost:5173
TRUST_PROXY=false
PILOT_DB_SSL=true
```

### 3. Pilot schema + seed
Project root থেকে:

```bash
node scripts/pilot_setup.mjs
```

এটি schema, migrations 006–037 এবং pilot seed data প্রয়োগ করবে।

### 4. Verify

```bash
node scripts/pilot_verify.mjs
```

Expected result:

```text
PILOT VERIFY: 11/11 PASS
```

### 5. Backend চালু

```bash
cd backend
npm start
```

### 6. Frontend dependency + build

```bash
cd frontend
npm install
npm run build
```

> এই বর্তমান development environment-এ package installation network timeout করেছে। তাই local Windows PC বা এমন environment ব্যবহার করুন যেখানে npm registry access আছে।

## Pilot acceptance checklist

1. Login / logout
2. Admin role + user role
3. Student create/edit/search
4. Teacher create/edit/search
5. Guardian account/link
6. Attendance entry/report
7. Marks/result entry
8. Assignment
9. Fees
10. Library loan
11. Notice
12. Document/print flows
13. Session invalidation
14. Responsive public View Page
15. Public navigation/submenus

Pilot data দিয়ে উপরোক্ত সব পরীক্ষা সফল হওয়ার পরেই production database/domain/hosting নির্বাচন করা হবে।
