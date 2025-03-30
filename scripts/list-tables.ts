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
    // List all tables in the database
    console.log("Listing all tables in the database...");
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(
      "Tables:",
      tables.map((t) => t.table_name),
    );

    // Try to find user-related tables
    const userTables = tables.filter((t) =>
      t.table_name.toLowerCase().includes("user"),
    );
    console.log(
      "Potential user tables:",
      userTables.map((t) => t.table_name),
    );
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sql.end();
    console.log("Connection closed");
  }
})().catch((error) => {
  console.error("Unhandled promise rejection:", error);
  process.exit(1);
});
