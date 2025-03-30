"use server";

import { db } from "~/server/db";
import { tasks, taskLabels } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Get all tasks for a project card
export async function getCardTasks(projectCardId: string) {
  if (!projectCardId) return [];

  try {
    const cardTasks = await db.query.tasks.findMany({
      where: eq(tasks.projectCardId, projectCardId),
      orderBy: tasks.position,
      with: {
        taskLabels: {
          with: {
            label: true,
          },
        },
      },
    });

    // Transform the task data to include labels array
    const transformedTasks = cardTasks.map((task) => {
      return {
        ...task,
        labels: task.taskLabels.map((tl) => tl.label),
      };
    });

    return transformedTasks;
  } catch (error) {
    console.error("Failed to fetch card tasks:", error);
    return [];
  }
}

// Create a new task
export async function createTask(
  projectCardId: string,
  title: string,
  description?: string | null,
) {
  if (!projectCardId || !title.trim()) {
    throw new Error("Project card ID and task title are required");
  }

  try {
    // Get the next position for the task
    const existingTasks = await db.query.tasks.findMany({
      where: eq(tasks.projectCardId, projectCardId),
      orderBy: tasks.position,
    });
    const nextPosition = existingTasks.length;

    // Create the task
    const taskId = uuidv4();
    await db.insert(tasks).values({
      id: taskId,
      title,
      description: description || null,
      projectCardId,
      status: "todo",
      position: nextPosition,
    });

    return await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });
  } catch (error) {
    console.error("Failed to create task:", error);
    throw new Error("Failed to create task");
  }
}

// Update a task
export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string | null;
    status?: "todo" | "in-progress" | "completed";
  },
) {
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  try {
    await db.update(tasks).set(data).where(eq(tasks.id, taskId));

    return await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        taskLabels: {
          with: {
            label: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to update task:", error);
    throw new Error("Failed to update task");
  }
}

// Delete a task
export async function deleteTask(taskId: string) {
  if (!taskId) {
    throw new Error("Task ID is required");
  }

  try {
    // Delete the task
    await db.delete(tasks).where(eq(tasks.id, taskId));
    return true;
  } catch (error) {
    console.error("Failed to delete task:", error);
    throw new Error("Failed to delete task");
  }
}

// Helper function to get the task labels
export async function getTaskLabelsWithDetails(taskId: string) {
  if (!taskId) return [];

  try {
    const result = await db.query.taskLabels.findMany({
      where: eq(taskLabels.taskId, taskId),
      with: {
        label: true,
      },
    });

    return result.map((item) => item.label);
  } catch (error) {
    console.error("Failed to fetch task labels:", error);
    return [];
  }
}
