const { Pool } = require('pg');

// Load environment variables from .env file if not already loaded
require('dotenv').config({ path: './.env' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Neon, as it uses SSL
  },
});

async function createIndexes() {
  const client = await pool.connect();
  try {
    console.log('Connected to database. Creating indexes...');

    const indexCommands = [
      "CREATE INDEX IF NOT EXISTS idx_students_exam_type ON students (exam_type);",
      "CREATE INDEX IF NOT EXISTS idx_students_year ON students (year);",
      "CREATE INDEX IF NOT EXISTS idx_students_institution_name ON students (institution_name);",
      "CREATE INDEX IF NOT EXISTS idx_students_total_marks ON students (total_marks DESC);",
      "CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students (roll_number);",
      "CREATE INDEX IF NOT EXISTS idx_students_student_name ON students (student_name);",
      "CREATE INDEX IF NOT EXISTS idx_students_institution_total_marks ON students (institution_name, total_marks DESC);"
    ];

    for (const command of indexCommands) {
      console.log(`Executing: ${command}`);
      await client.query(command);
      console.log('Index created successfully.');
    }

    console.log('All indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1); // Exit with error code
  } finally {
    client.release();
    await pool.end(); // Close the pool after all operations
    console.log('Database connection pool closed.');
  }
}

createIndexes();