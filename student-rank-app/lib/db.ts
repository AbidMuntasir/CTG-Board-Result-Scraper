// student-rank-app/lib/db.ts
import { Pool } from 'pg';

// Ensure DATABASE_URL is set in your environment variables (e.g., .env.local)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set.');
}

// Create a new Pool instance
const pool = new Pool({
  connectionString,
  ssl: {
    // Required for Neon, as it uses SSL
    rejectUnauthorized: false, // You might want to set this to true in production with proper certificates
  },
});

// Export a function to execute queries
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}

// Optional: Add a function to end the pool (useful for graceful shutdown in some environments)
export async function endPool() {
  await pool.end();
  console.log('PostgreSQL connection pool closed.');
}