const { Pool } = require("pg");

let pool;

// Heroku, Vercel, Netlify, Supabase, Render, etc., all use DATABASE_URL.
// This is the standard for production environments.
if (process.env.DATABASE_URL) {
  // Production environment
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Local development environment
  // It will use the variables from your local .env file
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
}

module.exports = pool;
