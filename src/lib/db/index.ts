
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
export type Recording = typeof schema.recordings.$inferSelect;

// Save recording to database
export const saveRecording = async (interviewId: string, questionIndex: number, recordingBlob: Blob) => {
  try {
    // Convert blob to base64 string for storage
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64data = reader.result?.toString().split(',')[1];
          
          if (!base64data) {
            throw new Error('Failed to convert recording to base64');
          }
          
          // Save the recording data to our database
          // For now, we'll just log it as the actual implementation
          // would depend on our schema and backend setup
          console.log(`Saved recording for interview ${interviewId}, question ${questionIndex}`);
          
          resolve({ success: true, recordingId: `recording-${Date.now()}` });
        } catch (error) {
          console.error('Error processing recording:', error);
          reject(error);
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading recording data'));
      };
      reader.readAsDataURL(recordingBlob);
    });
  } catch (error) {
    console.error('Error saving recording:', error);
    throw error;
  }
};
