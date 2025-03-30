import postgres from "postgres";
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
    console.log("Checking tables in the database...");

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log("Tables in the database:");
    tables.forEach((table) => {
      console.log(`- ${table.table_name}`);
    });

    // Check if there's a card or similar table
    console.log("\nSearching for card-like tables:");
    const cardTables = tables.filter(
      (t) =>
        t.table_name.includes("card") ||
        t.table_name.includes("task") ||
        t.table_name.includes("item"),
    );

    if (cardTables.length > 0) {
      cardTables.forEach((table) => {
        console.log(`- ${table.table_name}`);
      });
    } else {
      console.log("No card-like tables found.");
    }
  } catch (error) {
    console.error("Error checking tables:", error);
  } finally {
    await sql.end();
    console.log("Connection closed");
  }
})();
