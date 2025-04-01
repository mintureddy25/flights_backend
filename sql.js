// Load environment variables from .env file
require('dotenv').config();

const postgres = require('postgres'); // Correct CommonJS import

// Get connection string from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// Initialize the connection with the correct syntax
const sql = postgres(connectionString);  // Here we call postgres() with the connection string

module.exports = {sql};
