import { auth } from "@clerk/nextjs/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
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
    // Try to get GitHub username if available through OAuth
    let githubUsername = "";
    let gitlabUsername = "";

    try {
      // Get GitHub OAuth access tokens if they exist
      const client = await clerkClient();

      try {
        // Access tokens are returned in a paginated response with a data property
        const githubTokensResponse = await client.users.getUserOauthAccessToken(
          user.id,
          "oauth_github",
        );

        // Check if we have any tokens in the response
        const githubTokens = githubTokensResponse.data;
        if (githubTokens && githubTokens.length > 0 && githubTokens[0]?.token) {
          const response = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${githubTokens[0].token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            githubUsername = data.login || "";
          }
        }
      } catch (error) {
        console.error("Error fetching GitHub OAuth tokens:", error);
      }

      try {
        // Same process for GitLab if needed
        const gitlabTokensResponse = await client.users.getUserOauthAccessToken(
          user.id,
          "oauth_gitlab",
        );

        const gitlabTokens = gitlabTokensResponse.data;
        if (gitlabTokens && gitlabTokens.length > 0 && gitlabTokens[0]?.token) {
          const response = await fetch("https://gitlab.com/api/v4/user", {
            headers: {
              Authorization: `Bearer ${gitlabTokens[0].token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            gitlabUsername = data.username || "";
          }
        }
      } catch (error) {
        console.error("Error fetching GitLab OAuth tokens:", error);
      }
    } catch (error) {
      console.error("Error fetching OAuth usernames:", error);
    }

    await db.insert(users).values({
      id: user.id,
      name:
        `${user.firstName} ${user.lastName}`.trim() ??
        user.username ??
        user.emailAddresses[0]?.emailAddress ??
        "User",
      email: user.emailAddresses[0]?.emailAddress ?? "",
      imageUrl: user.imageUrl ?? "",
      githubUsername,
      gitlabUsername,
    });
  }

  return user.id;
}
