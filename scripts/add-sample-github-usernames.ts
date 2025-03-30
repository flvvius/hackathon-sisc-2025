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

// Sample GitHub and GitLab handles to assign to users
const sampleHandles = [
  { github: "octocat", gitlab: "gitlab-user1" },
  { github: "torvalds", gitlab: "gitlab-user2" },
  { github: "gaearon", gitlab: "gitlab-user3" },
  { github: "flavius", gitlab: "flavius-gl" },
  { github: "yyx990803", gitlab: "" }, // Evan You - Vue.js creator
  { github: "", gitlab: "gitlab-user5" }, // Only GitLab
];

// Use correct table name from database
const TABLE_NAME = "hackathon_user";

(async () => {
  try {
    console.log(
      `Adding sample GitHub and GitLab usernames to ${TABLE_NAME} table...`,
    );

    // 1. First get all users
    console.log("Getting users from database...");
    const users = await sql`SELECT "id" FROM ${sql(TABLE_NAME)}`;

    if (users.length === 0) {
      console.log("No users found in the database.");
      return;
    }

    console.log(`Found ${users.length} users in the database.`);

    // 2. Update each user with GitHub and GitLab usernames
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const handle = sampleHandles[i % sampleHandles.length];

      console.log(
        `Updating user ${user.id} with GitHub: ${handle.github}, GitLab: ${handle.gitlab}`,
      );

      await sql`
        UPDATE ${sql(TABLE_NAME)}
        SET "githubUsername" = ${handle.github}, 
            "gitlabUsername" = ${handle.gitlab}
        WHERE "id" = ${user.id}
      `;
    }

    console.log("Sample GitHub and GitLab usernames added successfully!");

    // 3. Verify the updates
    const updatedUsers = await sql`
      SELECT "id", "name", "email", "githubUsername", "gitlabUsername"
      FROM ${sql(TABLE_NAME)}
    `;

    console.log("Updated users:", updatedUsers);
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
