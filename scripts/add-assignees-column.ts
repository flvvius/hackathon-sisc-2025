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
    console.log("Adding assignees column to hackathon_hackathon_card table...");
    // First check if the column exists
    const checkResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'hackathon_hackathon_card' AND column_name = 'assignees'
    `;

    if (checkResult.length === 0) {
      await sql`ALTER TABLE hackathon_hackathon_card ADD COLUMN assignees JSONB DEFAULT NULL`;
      console.log("Assignees column added successfully!");
    } else {
      console.log("Assignees column already exists.");
    }
  } catch (error) {
    console.error("Error adding assignees column:", error);
  } finally {
    await sql.end();
    console.log("Connection closed");
  }
})();
