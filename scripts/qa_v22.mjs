import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const server = fs.readFileSync(path.join(root, 'backend/src/server.js'), 'utf8');
const security = fs.readFileSync(path.join(root, 'backend/src/security.js'), 'utf8');
const schema = fs.readFileSync(path.join(root, 'database/schema.sql'), 'utf8');
const migration = fs.readFileSync(path.join(root, 'database/migrations/017_session_invalidation.sql'), 'utf8');

const checks = [
  ['token version migration', migration.includes('auth_token_version INTEGER NOT NULL DEFAULT 0')],
  ['JWT contains token version', server.includes('token_version')],
  ['auth rejects stale token', server.includes("claims.token_version") && server.includes("stale session")],
  ['password change invalidates sessions', server.includes('auth_token_version=auth_token_version+1')],
  ['production env validation', security.includes('validateProductionEnv')],
  ['request id middleware', server.includes('app.use(requestId)')],
  ['global API rate limit', server.includes("app.use('/api/', apiLimiter)")],
  ['health endpoint', server.includes("app.get('/health'")],
  ['readiness endpoint', server.includes("app.get('/ready'")],
  ['notification role query uses roles table', server.includes('r.name role_name,r.label_bn')],
  ['session column in canonical schema', schema.includes('auth_token_version INTEGER NOT NULL DEFAULT 0')],
];
let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
console.log(`V22 static QA passed: ${checks.length} checks`);
