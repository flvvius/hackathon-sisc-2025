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
    console.log("Checking hackathon_card table structure...");

    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'hackathon_card'
      ORDER BY ordinal_position
    `;

    console.log("Columns in hackathon_card table:");
    columns.forEach((column) => {
      console.log(
        `- ${column.column_name} (${column.data_type}, nullable: ${column.is_nullable})`,
      );
    });
  } catch (error) {
    console.error("Error checking table structure:", error);
  } finally {
    await sql.end();
    console.log("Connection closed");
  }
})();
