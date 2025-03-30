"use server";

import { db } from "~/server/db";
import { boardMembers, users } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";

// Types for the board members
export type BoardMemberRole = "owner" | "admin" | "member" | "viewer";

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  role: BoardMemberRole;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    imageUrl: string | null;
  };
  createdAt: Date;
  updatedAt: Date | null;
}

// Check if the current user has permission to manage board members
async function canManageBoardMembers(boardId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  // Check if user is an owner or admin of the board
  const member = await db.query.boardMembers.findFirst({
    where: and(
      eq(boardMembers.boardId, boardId),
      eq(boardMembers.userId, userId),
    ),
  });

  return member?.role === "owner" || member?.role === "admin";
}

// Get all board members for a board
export async function getBoardMembers(boardId: string): Promise<BoardMember[]> {
  if (!boardId) return [];

  try {
    const members = await db.query.boardMembers.findMany({
      where: eq(boardMembers.boardId, boardId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    return members as BoardMember[];
  } catch (error) {
    console.error("Failed to fetch board members:", error);
    return [];
  }
}

// Add a member to a board
export async function addBoardMember(
  boardId: string,
  userEmail: string,
  role: BoardMemberRole = "member",
): Promise<BoardMember | null> {
  if (!boardId || !userEmail) {
    throw new Error("Board ID and user email are required");
  }

  // Check if current user has permission
  const hasPermission = await canManageBoardMembers(boardId);
  if (!hasPermission) {
    throw new Error("You don't have permission to add members to this board");
  }

  try {
    // Find the user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, userEmail),
    });

    if (!user) {
      throw new Error(`User with email ${userEmail} not found`);
    }

    // Check if the user is already a member
    const existingMember = await db.query.boardMembers.findFirst({
      where: and(
        eq(boardMembers.boardId, boardId),
        eq(boardMembers.userId, user.id),
      ),
    });

    if (existingMember) {
      throw new Error(`User ${userEmail} is already a member of this board`);
    }

    // Add the user as a board member
    const memberId = uuidv4();
    await db.insert(boardMembers).values({
      id: memberId,
      boardId,
      userId: user.id,
      role,
    });

    // Return the newly created member
    const newMember = await db.query.boardMembers.findFirst({
      where: eq(boardMembers.id, memberId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    return newMember as BoardMember;
  } catch (error) {
    console.error("Failed to add board member:", error);
    throw error;
  }
}

// Update a board member's role
export async function updateBoardMemberRole(
  memberId: string,
  role: BoardMemberRole,
): Promise<BoardMember | null> {
  if (!memberId) {
    throw new Error("Member ID is required");
  }

  try {
    // Get the member to check permissions
    const member = await db.query.boardMembers.findFirst({
      where: eq(boardMembers.id, memberId),
    });

    if (!member) {
      throw new Error("Board member not found");
    }

    // Check if current user has permission
    const hasPermission = await canManageBoardMembers(member.boardId);
    if (!hasPermission) {
      throw new Error(
        "You don't have permission to update member roles on this board",
      );
    }

    // Update the member's role
    await db
      .update(boardMembers)
      .set({ role })
      .where(eq(boardMembers.id, memberId));

    // Return the updated member
    const updatedMember = await db.query.boardMembers.findFirst({
      where: eq(boardMembers.id, memberId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    return updatedMember as BoardMember;
  } catch (error) {
    console.error("Failed to update board member:", error);
    throw error;
  }
}

// Remove a member from a board
export async function removeBoardMember(memberId: string): Promise<boolean> {
  if (!memberId) {
    throw new Error("Member ID is required");
  }

  try {
    // Get the member to check permissions
    const member = await db.query.boardMembers.findFirst({
      where: eq(boardMembers.id, memberId),
    });

    if (!member) {
      throw new Error("Board member not found");
    }

    // Check if current user has permission
    const hasPermission = await canManageBoardMembers(member.boardId);
    if (!hasPermission) {
      throw new Error(
        "You don't have permission to remove members from this board",
      );
    }

    // Check if the member being removed is the owner
    if (member.role === "owner") {
      // Only allow removal if there's another owner
      const owners = await db.query.boardMembers.findMany({
        where: and(
          eq(boardMembers.boardId, member.boardId),
          eq(boardMembers.role, "owner"),
        ),
      });

      if (owners.length <= 1) {
        throw new Error("Cannot remove the only owner of the board");
      }
    }

    // Remove the member
    await db.delete(boardMembers).where(eq(boardMembers.id, memberId));

    return true;
  } catch (error) {
    console.error("Failed to remove board member:", error);
    throw error;
  }
}
