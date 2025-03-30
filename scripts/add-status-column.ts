import postgres from "postgres";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Get the database URL from environment variables
const dbUrl =
  process.env.DATABASE_URL ||
  "postgres://default:0afH7iEkTKRI@ep-still-scene-a2bfaosd-pooler.eu-central-1.aws.neon.tech/verceldb?sslmode=require";

console.log("Using database URL:", dbUrl);

const sql = postgres(dbUrl);

(async () => {
  try {
    console.log("Adding status column to card table...");
    await sql`ALTER TABLE card ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'todo'`;
    console.log("Status column added successfully!");
  } catch (error) {
    console.error("Error adding status column:", error);
  } finally {
    await sql.end();
    console.log("Connection closed");
  }
})();
