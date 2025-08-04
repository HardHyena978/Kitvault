// createAdmin.js
const pool = require("./db"); // Use your existing pool
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function makeAdmin() {
  console.log("Connecting to PostgreSQL...");

  // --- ADDED ADMIN NAME ---
  const adminName = "Administrator"; // Or your own name
  const adminEmail = "admin@kitvault.com";
  const adminPassword = "assy2411";

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(adminPassword, salt);

  try {
    // --- UPDATED QUERY ---
    // The query now includes the 'name' column in both the
    // INSERT and UPDATE parts.
    const upsertQuery = `
            INSERT INTO users (name, email, password_hash, is_admin)
            VALUES ($1, $2, $3, TRUE)
            ON CONFLICT (email) 
            DO UPDATE SET is_admin = TRUE, name = $1;
        `;

    // Pass the adminName as the first parameter
    await pool.query(upsertQuery, [adminName, adminEmail, password_hash]);

    console.log(`✅ Success! User ${adminEmail} is now an administrator.`);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  }
}

makeAdmin();
