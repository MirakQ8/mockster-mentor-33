
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Replace with your actual Neon database URL
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/interview_app';

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

export type Interview = typeof schema.interviews.$inferSelect;
export type Question = typeof schema.questions.$inferSelect;
