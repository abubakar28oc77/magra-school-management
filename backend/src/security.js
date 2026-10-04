import crypto from 'crypto';

export function validateProductionEnv() {
  const prod = process.env.NODE_ENV === 'production';
  const errors = [];
  if (prod && !process.env.DATABASE_URL) errors.push('DATABASE_URL is required in production');
  if (prod && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.includes('REPLACE_WITH'))) errors.push('JWT_SECRET must be a strong 32+ character secret in production');
  if (prod && (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN.split(',').some(v => !/^https:\/\//.test(v.trim())))) errors.push('CORS_ORIGIN must contain explicit HTTPS origins in production');
  if (errors.length) throw new Error(errors.join('; '));
}

export const requestId = (req, res, next) => {
  const id = req.get('x-request-id') || crypto.randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};

export const errorHandler = (err, req, res, _next) => {
  console.error(`[${req.requestId || 'no-request-id'}]`, err);
  if (res.headersSent) return;
  res.status(err.status || 500).json({ message: err.publicMessage || 'সার্ভারে একটি সমস্যা হয়েছে', requestId: req.requestId });
};
