import process from 'node:process';
import pg from 'pg';
const {Client}=pg;
const url=process.env.DATABASE_URL;
if(!url){console.error('DATABASE_URL is required.');process.exit(1)}
if(process.env.NODE_ENV==='production'){console.error('Refusing pilot cleanup with NODE_ENV=production.');process.exit(1)}
const c=new Client({connectionString:url,ssl:process.env.PILOT_DB_SSL==='true'?{rejectUnauthorized:false}:undefined});
try{
 await c.connect(); await c.query('BEGIN');
 await c.query("DELETE FROM students WHERE student_id LIKE 'PILOT-%'");
 await c.query("DELETE FROM teachers WHERE employee_id LIKE 'PILOT-%'");
 await c.query("DELETE FROM assignments WHERE title_bn='Pilot Assignment'");
 await c.query("DELETE FROM exams WHERE name_bn='Pilot Test Exam'");
 await c.query("DELETE FROM subjects WHERE code LIKE 'PILOT-%'");
 await c.query("DELETE FROM books WHERE isbn='PILOT-ISBN-001'");
 await c.query("DELETE FROM notices WHERE title_bn='পাইলট পরীক্ষা সংক্রান্ত নোটিশ'");
 await c.query("UPDATE audit_logs SET user_id=NULL WHERE user_id IN (SELECT id FROM users WHERE login_id LIKE 'pilot-%')");
 await c.query("DELETE FROM users WHERE login_id LIKE 'pilot-%'");
 await c.query('COMMIT');
 console.log('PILOT CLEANUP COMPLETE');
}catch(e){await c.query('ROLLBACK').catch(()=>{});console.error('PILOT CLEANUP FAILED:',e.message);process.exitCode=1}finally{await c.end().catch(()=>{})}
