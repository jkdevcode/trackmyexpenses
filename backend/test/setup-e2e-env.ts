process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'e2e-secret-key-with-min-32-characters';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
process.env.CSRF_ORIGIN_CHECK_ENABLED = process.env.CSRF_ORIGIN_CHECK_ENABLED ?? 'false';

const currentDatabaseUrl = process.env.DATABASE_URL;
if (!currentDatabaseUrl || currentDatabaseUrl.includes('HOST:3306')) {
  process.env.DATABASE_URL = 'mysql://root:@localhost:3306/invoicely';
}
