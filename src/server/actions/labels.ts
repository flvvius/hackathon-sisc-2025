"use server";

import { db } from "~/server/db";
import { labels, projectLabels, taskLabels } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Types for labels
export interface Label {
  id: string;
  text: string;
  color: string;
  boardId: string;
  createdAt: Date;
}

// Get all labels for a board
export async function getBoardLabels(boardId: string): Promise<Label[]> {
  if (!boardId) return [];

  try {
    const boardLabels = await db.query.labels.findMany({
      where: eq(labels.boardId, boardId),
    });

    return boardLabels as Label[];
  } catch (error) {
    console.error("Failed to fetch board labels:", error);
    return [];
  }
}

// Create a new label
export async function createLabel(
  boardId: string,
  text: string,
  color: string,
): Promise<Label | null> {
  if (!boardId || !text.trim() || !color.trim()) {
    throw new Error("Board ID, label text, and color are required");
  }

  try {
    const labelId = uuidv4();
    await db.insert(labels).values({
      id: labelId,
      text,
      color,
      boardId,
    });

    const newLabel = await db.query.labels.findFirst({
      where: eq(labels.id, labelId),
    });

    return newLabel as Label;
  } catch (error) {
    console.error("Failed to create label:", error);
    throw new Error("Failed to create label");
  }
}

// Update an existing label
export async function updateLabel(
  labelId: string,
  data: { text?: string; color?: string },
): Promise<Label | null> {
  if (!labelId) {
    throw new Error("Label ID is required");
  }

  try {
    await db.update(labels).set(data).where(eq(labels.id, labelId));

    const updatedLabel = await db.query.labels.findFirst({
      where: eq(labels.id, labelId),
    });

    return updatedLabel as Label;
  } catch (error) {
    console.error("Failed to update label:", error);
    throw new Error("Failed to update label");
  }
}

// Delete a label
export async function deleteLabel(labelId: string): Promise<boolean> {
  if (!labelId) {
    throw new Error("Label ID is required");
  }

  try {
    await db.delete(labels).where(eq(labels.id, labelId));
    return true;
  } catch (error) {
    console.error("Failed to delete label:", error);
    throw new Error("Failed to delete label");
  }
}

// Add a label to a task
export async function addLabelToTask(
  taskId: string,
  labelId: string,
): Promise<boolean> {
  if (!taskId || !labelId) {
    throw new Error("Task ID and Label ID are required");
  }

  try {
    // Check if the association already exists
    const existingAssociation = await db.query.taskLabels.findFirst({
      where: and(
        eq(taskLabels.taskId, taskId),
        eq(taskLabels.labelId, labelId),
      ),
    });

    if (existingAssociation) {
      return true; // Association already exists
    }

    // Create a new association
    await db.insert(taskLabels).values({
      id: uuidv4(),
      taskId,
      labelId,
    });

    return true;
  } catch (error) {
    console.error("Failed to add label to task:", error);
    throw new Error("Failed to add label to task");
  }
}

// Remove a label from a task
export async function removeLabelFromTask(
  taskId: string,
  labelId: string,
): Promise<boolean> {
  if (!taskId || !labelId) {
    throw new Error("Task ID and Label ID are required");
  }

  try {
    await db
      .delete(taskLabels)
      .where(
        and(eq(taskLabels.taskId, taskId), eq(taskLabels.labelId, labelId)),
      );
    return true;
  } catch (error) {
    console.error("Failed to remove label from task:", error);
    throw new Error("Failed to remove label from task");
  }
}

// Get all labels for a task
export async function getTaskLabels(taskId: string): Promise<Label[]> {
  if (!taskId) return [];

  try {
    const result = await db.query.taskLabels.findMany({
      where: eq(taskLabels.taskId, taskId),
      with: {
        label: true,
      },
    });

    return result.map((item) => item.label) as Label[];
  } catch (error) {
    console.error("Failed to fetch task labels:", error);
    return [];
  }
}

// Add a label to a card (project)
export async function addLabelToProject(
  projectCardId: string,
  labelId: string,
): Promise<boolean> {
  if (!projectCardId || !labelId) {
    throw new Error("Project Card ID and Label ID are required");
  }

  try {
    // Check if the association already exists
    const existingAssociation = await db.query.projectLabels.findFirst({
      where: and(
        eq(projectLabels.projectCardId, projectCardId),
        eq(projectLabels.labelId, labelId),
      ),
    });

    if (existingAssociation) {
      return true; // Association already exists
    }

    // Create a new association
    await db.insert(projectLabels).values({
      id: uuidv4(),
      projectCardId,
      labelId,
    });

    return true;
  } catch (error) {
    console.error("Failed to add label to project:", error);
    throw new Error("Failed to add label to project");
  }
}

// Remove a label from a card (project)
export async function removeLabelFromProject(
  projectCardId: string,
  labelId: string,
): Promise<boolean> {
  if (!projectCardId || !labelId) {
    throw new Error("Project Card ID and Label ID are required");
  }

  try {
    await db
      .delete(projectLabels)
      .where(
        and(
          eq(projectLabels.projectCardId, projectCardId),
          eq(projectLabels.labelId, labelId),
        ),
      );
    return true;
  } catch (error) {
    console.error("Failed to remove label from project:", error);
    throw new Error("Failed to remove label from project");
  }
}

// Get all labels for a project
export async function getProjectLabels(
  projectCardId: string,
): Promise<Label[]> {
  if (!projectCardId) return [];

  try {
    const result = await db.query.projectLabels.findMany({
      where: eq(projectLabels.projectCardId, projectCardId),
      with: {
        label: true,
      },
    });

    return result.map((item) => item.label) as Label[];
  } catch (error) {
    console.error("Failed to fetch project labels:", error);
    return [];
  }
}
