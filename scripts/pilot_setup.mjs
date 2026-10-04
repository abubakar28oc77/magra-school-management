import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { Client } from 'pg';

const root = process.cwd();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required. Set it to the temporary pilot PostgreSQL connection string.');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run pilot setup with NODE_ENV=production. Use a dedicated temporary pilot database.');
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl, ssl: process.env.PILOT_DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined });
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const migrations = fs.readdirSync(path.join(root, 'database', 'migrations'))
  .filter((f) => /^\d+_.*\.sql$/.test(f))
  .sort((a,b) => Number(a.slice(0,3)) - Number(b.slice(0,3)));

try {
  await client.connect();
  await client.query('SELECT 1');
  await client.query(read('database/schema.sql'));
  for (const file of migrations) {
    await client.query(read(`database/migrations/${file}`));
    console.log(`APPLIED | ${file}`);
  }
  await client.query(read('database/pilot/pilot_seed.sql'));
  const counts = await client.query(`
    SELECT
      (SELECT count(*) FROM users WHERE login_id LIKE 'pilot-%') AS pilot_users,
      (SELECT count(*) FROM teachers WHERE employee_id LIKE 'PILOT-%') AS pilot_teachers,
      (SELECT count(*) FROM students WHERE student_id LIKE 'PILOT-%') AS pilot_students,
      (SELECT count(*) FROM guardian_student_links gsl JOIN users u ON u.id=gsl.guardian_user_id WHERE u.login_id LIKE 'pilot-guardian-%') AS guardian_links,
      (SELECT count(*) FROM marks m JOIN students s ON s.id=m.student_id WHERE s.student_id LIKE 'PILOT-%') AS marks,
      (SELECT count(*) FROM attendance a JOIN students s ON s.id=a.student_id WHERE s.student_id LIKE 'PILOT-%') AS attendance,
      (SELECT count(*) FROM assignments WHERE title_bn='Pilot Assignment') AS assignments,
      (SELECT count(*) FROM notices WHERE title_bn='পাইলট পরীক্ষা সংক্রান্ত নোটিশ') AS notices
  `);
  console.log('PILOT SETUP COMPLETE');
  console.table(counts.rows);
} catch (error) {
  console.error('PILOT SETUP FAILED:', error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
