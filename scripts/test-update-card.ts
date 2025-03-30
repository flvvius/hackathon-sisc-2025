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
    // First get the first card to update
    console.log("Fetching a card to update...");
    const cards = await sql`
      SELECT id, title, description, labels
      FROM hackathon_card
      LIMIT 1
    `;

    if (cards.length === 0) {
      console.log("No cards found in the database.");
      return;
    }

    const card = cards[0];
    console.log("Found card:", card);

    // Now update the card with some test labels
    const testLabels = [
      { text: "Test Label 1", color: "green" },
      { text: "Test Label 2", color: "red" },
    ];

    console.log("Updating card with test labels...");
    await sql`
      UPDATE hackathon_card
      SET labels = ${JSON.stringify(testLabels)}
      WHERE id = ${card.id}
    `;

    // Verify the update
    const updatedCard = await sql`
      SELECT id, title, description, labels
      FROM hackathon_card
      WHERE id = ${card.id}
    `;

    console.log("Card after update:", updatedCard[0]);
  } catch (error) {
    console.error("Error in test script:", error);
  } finally {
    await sql.end();
    console.log("Connection closed");
  }
})();
