// Corrected backend/db.js
const { Pool } = require("pg");

// Check if we are in a production environment (like Netlify)
const isProduction = process.env.NODE_ENV === "production";

// The connection configuration object
const connectionConfig = {
  // Use the single DATABASE_URL if it exists (for production)
  connectionString: process.env.DATABASE_URL,
  // Enable SSL in production and disable it for local development
  // Supabase requires SSL.
  ssl: isProduction ? { rejectUnauthorized: false } : false,
};

// If we are NOT in production and have the individual variables, use them instead.
// This preserves your local development setup.
if (!isProduction) {
  connectionConfig.user = process.env.DB_USER;
  connectionConfig.host = process.env.DB_HOST;
  connectionConfig.database = process.env.DB_DATABASE;
  connectionConfig.password = process.env.DB_PASSWORD;
  connectionConfig.port = process.env.DB_PORT;
  // We don't need the connectionString if we have the individual parts
  delete connectionConfig.connectionString;
}

const pool = new Pool(connectionConfig);

module.exports = pool;
