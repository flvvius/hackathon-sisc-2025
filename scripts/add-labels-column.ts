import postgres from "postgres";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Get the database URL from environment variables
const dbUrl =
  process.env.DATABASE_URL ??
  "postgres://default:0afH7iEkTKRI@ep-still-scene-a2bfaosd-pooler.eu-central-1.aws.neon.tech/verceldb?sslmode=require";

console.log("Using database URL:", dbUrl);

const sql = postgres(dbUrl);

(async () => {
  try {
    console.log("Adding labels column to hackathon_card table...");
    // First check if the column exists
    const checkResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'hackathon_card' AND column_name = 'labels'
    `;

    if (checkResult.length === 0) {
      await sql`ALTER TABLE hackathon_card ADD COLUMN labels JSONB DEFAULT NULL`;
      console.log("Labels column added successfully!");
    } else {
      console.log("Labels column already exists.");
    }
  } catch (error) {
    console.error("Error adding labels column:", error);
  } finally {
    await sql.end();
    console.log("Connection closed");
  }
})();
