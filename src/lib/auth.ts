import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  return user;
}

export async function getAuth() {
  return await auth();
}

export async function getUserId() {
  const { userId } = await auth();
  return userId;
}

// Ensure user exists in our database
export async function ensureUserInDb() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  // Check if user exists in our database
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  // If not, create the user
  if (!existingUser) {
    await db.insert(users).values({
      id: user.id,
      name:
        `${user.firstName} ${user.lastName}`.trim() ??
        user.username ??
        user.emailAddresses[0]?.emailAddress ??
        "User",
      email: user.emailAddresses[0]?.emailAddress ?? "",
      imageUrl: user.imageUrl ?? "",
    });
  }

  return user.id;
}
