
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// NeonDB connection URL
const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_M2CNSk8RtbFs@ep-lingering-star-a5rbb54f-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

// Create a SQL connection
const sql = neon(databaseUrl);
// Create a Drizzle instance with the connection
export const db = drizzle(sql, { schema });

export type Interview = typeof schema.interviews.$inferSelect;
export type Question = typeof schema.questions.$inferSelect;
