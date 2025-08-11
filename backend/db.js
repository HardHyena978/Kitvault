// backend/db.js

// Import the 'pg' library, which is the Node.js driver for PostgreSQL
const { Pool } = require("pg");

// Load environment variables from our .env file
require("dotenv").config();
const isProduction = process.env.NODE_ENV === "production";

// A "Pool" is an efficient way to manage multiple client connections to the database.
// It will automatically handle opening and closing connections.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

// We export the pool so we can import it and use it in other files.
module.exports = pool;
