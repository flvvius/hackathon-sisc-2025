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

// The actual table name in the database
const TABLE_NAME = "hackathon_user";

(async () => {
  try {
    console.log(
      `Adding GitHub and GitLab username columns to ${TABLE_NAME} table...`,
    );

    // Check if the GitHub column exists - use plain text for table names
    const checkGithubQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${TABLE_NAME}' AND column_name = 'github_username'
    `;
    const checkGithub = await sql.unsafe(checkGithubQuery);

    // Check if the GitLab column exists
    const checkGitlabQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${TABLE_NAME}' AND column_name = 'gitlab_username'
    `;
    const checkGitlab = await sql.unsafe(checkGitlabQuery);

    // Add GitHub column if it doesn't exist
    if (checkGithub.length === 0) {
      await sql.unsafe(
        `ALTER TABLE ${TABLE_NAME} ADD COLUMN github_username VARCHAR(100)`,
      );
      console.log("GitHub username column added successfully!");
    } else {
      console.log("GitHub username column already exists.");
    }

    // Add GitLab column if it doesn't exist
    if (checkGitlab.length === 0) {
      await sql.unsafe(
        `ALTER TABLE ${TABLE_NAME} ADD COLUMN gitlab_username VARCHAR(100)`,
      );
      console.log("GitLab username column added successfully!");
    } else {
      console.log("GitLab username column already exists.");
    }
  } catch (error) {
    console.error("Error adding columns:", error);
  } finally {
    await sql.end();
    console.log("Connection closed");
  }
})().catch((error) => {
  console.error("Unhandled promise rejection:", error);
  process.exit(1);
});
