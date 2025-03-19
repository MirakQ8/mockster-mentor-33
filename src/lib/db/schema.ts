
import { pgTable, serial, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const interviewStatusEnum = pgEnum('interview_status', ['pending', 'completed']);

// Tables
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const interviews = pgTable('interviews', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  jobTitle: text('job_title').notNull(),
  yearsExperience: integer('years_experience').notNull(),
  status: interviewStatusEnum('status').default('pending').notNull(),
  overallScore: integer('overall_score'),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  interviewId: integer('interview_id').notNull().references(() => interviews.id),
  questionText: text('question_text').notNull(),
  answer: text('answer'),
  score: integer('score'),
  feedback: text('feedback'),
  orderIndex: integer('order_index').notNull(),
});
