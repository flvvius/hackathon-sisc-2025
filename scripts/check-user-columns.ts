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

const TABLE_NAME = "hackathon_user";

(async () => {
  try {
    // 1. Check table structure
    console.log(`Checking table structure for ${TABLE_NAME}...`);
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = ${TABLE_NAME}
      ORDER BY ordinal_position
    `;

    console.log("Table columns:", columns);

    // 2. Check if GitHub/GitLab columns exist
    const githubColumn = columns.find(
      (col) => col.column_name === "github_username",
    );
    const gitlabColumn = columns.find(
      (col) => col.column_name === "gitlab_username",
    );

    console.log("GitHub column exists:", Boolean(githubColumn));
    console.log("GitLab column exists:", Boolean(gitlabColumn));

    // 3. Get sample data
    const users = await sql`
      SELECT * FROM "${TABLE_NAME}" 
      LIMIT 5
    `;

    console.log("Sample user data:", users);

    // 4. Check column names in actual data
    if (users.length > 0) {
      console.log("User object properties:", Object.keys(users[0]));
    }
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
