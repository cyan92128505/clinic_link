import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infrastructure/database/drizzle/generated.ts',
  out: './src/infrastructure/database/drizzle/migrations',
  dialect: 'postgresql', // Use dialect instead of driver
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/clinic_management',
  },
});
