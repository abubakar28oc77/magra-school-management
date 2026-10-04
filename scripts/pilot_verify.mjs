import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Client } from 'pg';

const root = process.cwd();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing pilot verification against NODE_ENV=production.');
  process.exit(1);
}
const client = new Client({ connectionString: databaseUrl, ssl: process.env.PILOT_DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined });
const checks = [];
const check = (name, pass, detail='') => checks.push({name, pass:Boolean(pass), detail});
try {
  await client.connect();
  const r = await client.query(`
    SELECT
      (SELECT count(*) FROM users WHERE login_id LIKE 'pilot-%')::int AS pilot_users,
      (SELECT count(*) FROM teachers WHERE employee_id LIKE 'PILOT-%')::int AS pilot_teachers,
      (SELECT count(*) FROM students WHERE student_id LIKE 'PILOT-%')::int AS pilot_students,
      (SELECT count(*) FROM students WHERE student_id LIKE 'PILOT-%' AND user_id IS NOT NULL)::int AS linked_student_users,
      (SELECT count(*) FROM guardian_student_links gsl JOIN users u ON u.id=gsl.guardian_user_id WHERE u.login_id LIKE 'pilot-guardian-%')::int AS guardian_links,
      (SELECT count(*) FROM attendance a JOIN students s ON s.id=a.student_id WHERE s.student_id LIKE 'PILOT-%')::int AS attendance_rows,
      (SELECT count(*) FROM marks m JOIN students s ON s.id=m.student_id WHERE s.student_id LIKE 'PILOT-%')::int AS marks_rows,
      (SELECT count(*) FROM assignments WHERE title_bn='Pilot Assignment')::int AS assignment_rows,
      (SELECT count(*) FROM fees f JOIN students s ON s.id=f.student_id WHERE s.student_id LIKE 'PILOT-%')::int AS fee_rows,
      (SELECT count(*) FROM library_loans l JOIN students s ON s.id=l.student_id WHERE s.student_id LIKE 'PILOT-%')::int AS library_rows,
      (SELECT count(*) FROM notices WHERE title_bn='পাইলট পরীক্ষা সংক্রান্ত নোটিশ')::int AS notice_rows
  `);
  const x = r.rows[0];
  check('pilot users created', x.pilot_users >= 16, x.pilot_users);
  check('three pilot teachers', x.pilot_teachers === 3, x.pilot_teachers);
  check('ten pilot students', x.pilot_students === 10, x.pilot_students);
  check('student accounts linked', x.linked_student_users === 10, x.linked_student_users);
  check('guardian links', x.guardian_links >= 4, x.guardian_links);
  check('attendance smoke rows', x.attendance_rows >= 4, x.attendance_rows);
  check('marks smoke rows', x.marks_rows >= 1, x.marks_rows);
  check('assignment smoke row', x.assignment_rows >= 1, x.assignment_rows);
  check('fee smoke row', x.fee_rows >= 1, x.fee_rows);
  check('library smoke row', x.library_rows >= 1, x.library_rows);
  check('notice smoke row', x.notice_rows >= 1, x.notice_rows);
} catch (error) {
  check('database connection', false, error.message);
} finally {
  await client.end().catch(() => {});
}
for (const c of checks) console.log(`${c.pass ? 'PASS' : 'FAIL'} | ${c.name}${c.detail !== '' ? ` | ${c.detail}` : ''}`);
const failed = checks.filter((c) => !c.pass).length;
console.log(`PILOT VERIFY: ${checks.length - failed}/${checks.length} PASS`);
process.exitCode = failed ? 1 : 0;
