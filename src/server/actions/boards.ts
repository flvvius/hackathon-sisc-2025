"use server";

import { db } from "~/server/db";
import { boards, lists, cards, boardMembers } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { BoardMemberRole } from "./boardMembers";
import { auth } from "@clerk/nextjs/server";

export async function getUserBoards(userId: string) {
  if (!userId) return [];

  try {
    // Get boards where user is either the creator or a member
    const userBoardsAsCreator = await db.query.boards.findMany({
      where: eq(boards.userId, userId),
      with: {
        lists: {
          orderBy: lists.position,
        },
      },
    });

    // Get boards where user is a member
    const userBoardsAsMember = await db.query.boardMembers.findMany({
      where: eq(boardMembers.userId, userId),
      with: {
        board: {
          with: {
            lists: {
              orderBy: lists.position,
            },
          },
        },
      },
    });

    // Combine and deduplicate the boards
    const memberBoards = userBoardsAsMember.map((member) => member.board);
    const allBoards = [...userBoardsAsCreator];

    // Add member boards that aren't already in the creator boards
    for (const board of memberBoards) {
      if (!allBoards.some((b) => b.id === board.id)) {
        allBoards.push(board);
      }
    }

    return allBoards;
  } catch (error) {
    console.error("Failed to fetch user boards:", error);
    return [];
  }
}

export async function getBoardWithLists(boardId: string) {
  if (!boardId) return null;

  try {
    const board = await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
      with: {
        lists: {
          orderBy: lists.position,
          with: {
            cards: true,
          },
        },
      },
    });

    return board;
  } catch (error) {
    console.error(`Failed to fetch board ${boardId}:`, error);
    return null;
  }
}

export async function getBoardLists(boardId: string) {
  if (!boardId) return [];

  try {
    const boardLists = await db.query.lists.findMany({
      where: eq(lists.boardId, boardId),
      orderBy: lists.position,
      with: {
        cards: true,
      },
    });

    return boardLists;
  } catch (error) {
    console.error("Failed to fetch board lists:", error);
    return [];
  }
}

export async function createBoard(
  userId: string,
  title: string,
  description?: string,
) {
  if (!userId || !title.trim()) {
    throw new Error("User ID and title are required");
  }

  try {
    // Create a new board
    const boardId = uuidv4();
    await db.insert(boards).values({
      id: boardId,
      title,
      description: description ?? null,
      userId,
    });

    // Create default lists for the board
    const defaultLists = [
      { title: "To Do", position: 0 },
      { title: "In Progress", position: 1 },
      { title: "Done", position: 2 },
    ];

    for (const list of defaultLists) {
      await db.insert(lists).values({
        id: uuidv4(),
        title: list.title,
        position: list.position,
        boardId,
      });
    }

    // Add the creator as an owner of the board
    await db.insert(boardMembers).values({
      id: uuidv4(),
      boardId,
      userId,
      role: "owner" as BoardMemberRole,
    });

    // Return the newly created board with its lists
    return await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
      with: {
        lists: {
          orderBy: lists.position,
        },
      },
    });
  } catch (error) {
    console.error("Failed to create board:", error);
    throw new Error("Failed to create board");
  }
}

export async function createCard(
  listId: string,
  title: string,
  description?: string,
  type: "project" | "comment" = "project",
  labels?: Array<{
    text: string;
    color: string;
  }>,
  assignees?: Array<{
    id: string;
    name?: string | null;
    email?: string | null;
    imageUrl?: string | null;
  }>,
) {
  if (!listId || !title.trim()) {
    throw new Error("List ID and card title are required");
  }

  try {
    // Get the list to find its board ID
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, listId),
    });

    if (!list) {
      throw new Error("List not found");
    }

    // Check user's role on this board
    const { userId } = await auth();
    if (!userId) {
      throw new Error("You must be logged in to create cards");
    }

    const member = await db.query.boardMembers.findFirst({
      where: and(
        eq(boardMembers.boardId, list.boardId),
        eq(boardMembers.userId, userId),
      ),
    });

    if (!member) {
      throw new Error("You do not have access to this board");
    }

    // Viewers cannot create cards
    if (member.role === "viewer") {
      throw new Error("Viewers do not have permission to create cards");
    }

    const cardId = uuidv4();

    // Filter and clean up labels if provided
    const validatedLabels = labels
      ? labels
          .filter((label) => label.text?.trim() && label.color)
          .map((label) => ({
            text: label.text.trim(),
            color: label.color,
          }))
      : undefined;

    // Filter and clean up assignees if provided
    const validatedAssignees = assignees
      ? assignees.filter((assignee) => assignee.id)
      : undefined;

    await db.insert(cards).values({
      id: cardId,
      title,
      description: description ?? null,
      type,
      listId,
      position: await getNextCardPosition(listId),
      labels: validatedLabels,
      assignees: validatedAssignees,
    });

    return await db.query.cards.findFirst({
      where: eq(cards.id, cardId),
    });
  } catch (error) {
    console.error("Failed to create card:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to create card");
    }
  }
}

export async function moveCardToList(
  cardId: string,
  sourceListId: string,
  targetListId: string,
) {
  if (!cardId || !sourceListId || !targetListId) {
    throw new Error("Card ID, source list ID, and target list ID are required");
  }

  try {
    // Verify card exists and belongs to source list
    const existingCard = await db.query.cards.findFirst({
      where: and(eq(cards.id, cardId), eq(cards.listId, sourceListId)),
    });

    if (!existingCard) {
      throw new Error("Card not found in the source list");
    }

    // Update card with new list ID and position
    await db
      .update(cards)
      .set({
        listId: targetListId,
        position: await getNextCardPosition(targetListId),
      })
      .where(eq(cards.id, cardId));

    return true;
  } catch (error) {
    console.error("Failed to move card:", error);
    throw new Error("Failed to move card");
  }
}

export async function updateCard(
  cardId: string,
  data: {
    title?: string;
    description?: string | null;
    status?: "todo" | "in-progress" | "completed";
    labels?: Array<{
      text: string;
      color: string;
    }>;
    assignees?: Array<{
      id: string;
      name?: string | null;
      email?: string | null;
      imageUrl?: string | null;
    }>;
  },
) {
  if (!cardId) {
    throw new Error("Card ID is required");
  }

  try {
    // Get the card first to check permissions
    const card = await db.query.cards.findFirst({
      where: eq(cards.id, cardId),
    });

    if (!card) {
      throw new Error("Card not found");
    }

    // Get the list to find board ID
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, card.listId),
    });

    if (!list) {
      throw new Error("List not found");
    }

    // Check user's role on this board
    const { userId } = await auth();
    if (!userId) {
      throw new Error("You must be logged in to update cards");
    }

    const member = await db.query.boardMembers.findFirst({
      where: and(
        eq(boardMembers.boardId, list.boardId),
        eq(boardMembers.userId, userId),
      ),
    });

    if (!member) {
      throw new Error("You do not have access to this board");
    }

    // Viewers cannot update cards
    if (member.role === "viewer") {
      throw new Error("Viewers do not have permission to update cards");
    }

    // If labels are provided, ensure they're valid
    if (data.labels) {
      // Validate each label has text and color
      data.labels = data.labels
        .filter((label) => label.text?.trim() && label.color)
        .map((label) => ({
          text: label.text.trim(),
          color: label.color,
        }));
    }

    // If assignees are provided, ensure they're valid
    if (data.assignees) {
      // Validate each assignee has an id
      data.assignees = data.assignees.filter((assignee) => assignee.id);
    }

    await db.update(cards).set(data).where(eq(cards.id, cardId));

    return await db.query.cards.findFirst({
      where: eq(cards.id, cardId),
    });
  } catch (error) {
    console.error("Failed to update card:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to update card");
    }
  }
}

export async function deleteCard(cardId: string) {
  if (!cardId) {
    throw new Error("Card ID is required");
  }

  try {
    // Get the card first to check permissions
    const card = await db.query.cards.findFirst({
      where: eq(cards.id, cardId),
    });

    if (!card) {
      throw new Error("Card not found");
    }

    // Get the list to find board ID
    const list = await db.query.lists.findFirst({
      where: eq(lists.id, card.listId),
    });

    if (!list) {
      throw new Error("List not found");
    }

    // Check user's role on this board
    const { userId } = await auth();
    if (!userId) {
      throw new Error("You must be logged in to delete cards");
    }

    const member = await db.query.boardMembers.findFirst({
      where: and(
        eq(boardMembers.boardId, list.boardId),
        eq(boardMembers.userId, userId),
      ),
    });

    if (!member) {
      throw new Error("You do not have access to this board");
    }

    // Viewers cannot delete cards
    if (member.role === "viewer") {
      throw new Error("Viewers do not have permission to delete cards");
    }

    await db.delete(cards).where(eq(cards.id, cardId));
    return true;
  } catch (error) {
    console.error("Failed to delete card:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("Failed to delete card");
    }
  }
}

export async function updateBoard(
  boardId: string,
  data: {
    title?: string;
    description?: string | null;
  },
) {
  if (!boardId) {
    throw new Error("Board ID is required");
  }

  try {
    await db.update(boards).set(data).where(eq(boards.id, boardId));

    return await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
    });
  } catch (error) {
    console.error("Failed to update board:", error);
    throw new Error("Failed to update board");
  }
}

export async function createList(
  boardId: string,
  title: string,
  position: number,
) {
  if (!boardId || !title.trim()) {
    throw new Error("Board ID and list title are required");
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error("You must be logged in to create lists");
  }

  // Check if user is a member of the board
  const member = await db.query.boardMembers.findFirst({
    where: and(
      eq(boardMembers.boardId, boardId),
      eq(boardMembers.userId, userId),
    ),
  });
  if (!member) {
    throw new Error("You do not have access to this board");
  }
  if (member.role === "viewer") {
    throw new Error("Viewers do not have permission to create lists");
  }

  const listId = uuidv4();
  await db.insert(lists).values({
    id: listId,
    title: title.trim(),
    boardId,
    position,
  });

  // Return the new list (with empty cards array)
  return {
    id: listId,
    title: title.trim(),
    boardId,
    position,
    cards: [],
  };
}

// Helper functions
async function getNextCardPosition(listId: string): Promise<number> {
  const listCards = await db.query.cards.findMany({
    where: eq(cards.listId, listId),
    orderBy: cards.position,
  });

  // If no cards, start at position 0
  if (listCards.length === 0) {
    return 0;
  }

  // Otherwise, put it after the last card
  const maxPosition = Math.max(...listCards.map((card) => card.position ?? 0));
  return maxPosition + 1;
}
