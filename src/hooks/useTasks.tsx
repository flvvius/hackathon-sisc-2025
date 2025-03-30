"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";
import {
  getCardTasks,
  createTask,
  updateTask,
  deleteTask,
} from "~/server/actions/tasks";
import { useLabels } from "./useLabels";
import type { Label } from "~/server/actions/labels";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  projectCardId: string;
  status: "todo" | "in-progress" | "completed";
  position: number;
  labels?: Label[];
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

interface TasksContextType {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  createCardTask: (title: string, description?: string) => Promise<Task | null>;
  updateCardTask: (
    taskId: string,
    data: {
      title?: string;
      description?: string | null;
      status?: "todo" | "in-progress" | "completed";
    },
  ) => Promise<Task | null>;
  deleteCardTask: (taskId: string) => Promise<boolean>;
  refreshTasks: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | null>(null);

export const TasksProvider = ({
  children,
  projectCardId,
  boardId,
}: {
  children: React.ReactNode;
  projectCardId: string;
  boardId: string;
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getTaskLabels } = useLabels();

  const refreshTasks = useCallback(async () => {
    if (!projectCardId) return;

    setIsLoading(true);
    setError(null);
    try {
      const cardTasks = await getCardTasks(projectCardId);
      setTasks(cardTasks as Task[]);
    } catch (err) {
      console.error("Failed to fetch card tasks:", err);
      setError("Failed to load tasks");
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [projectCardId]);

  useEffect(() => {
    void refreshTasks();
  }, [refreshTasks]);

  const createCardTask = useCallback(
    async (title: string, description?: string) => {
      if (!projectCardId || !title.trim()) return null;

      try {
        const newTask = await createTask(projectCardId, title, description);
        if (newTask) {
          // Add an empty labels array to the new task
          const taskWithLabels = { ...newTask, labels: [] } as Task;
          setTasks((prev) => [...prev, taskWithLabels]);
          toast.success(`Task "${title}" created`);
          return taskWithLabels;
        }
        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create task";
        console.error("Failed to create task:", err);
        toast.error(errorMessage);
        return null;
      }
    },
    [projectCardId],
  );

  const updateCardTask = useCallback(
    async (
      taskId: string,
      data: {
        title?: string;
        description?: string | null;
        status?: "todo" | "in-progress" | "completed";
      },
    ) => {
      if (!taskId) return null;

      try {
        const updatedTask = await updateTask(taskId, data);
        if (updatedTask) {
          // Get labels for the task
          const labels = await getTaskLabels(taskId);

          // Update the task with the labels
          const taskWithLabels = { ...updatedTask, labels } as Task;

          setTasks((prev) =>
            prev.map((task) => (task.id === taskId ? taskWithLabels : task)),
          );

          if (data.status === "completed") {
            toast.success(`Task marked as completed`);
          } else {
            toast.success(`Task updated`);
          }

          return taskWithLabels;
        }
        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update task";
        console.error("Failed to update task:", err);
        toast.error(errorMessage);
        return null;
      }
    },
    [getTaskLabels],
  );

  const deleteCardTask = useCallback(async (taskId: string) => {
    if (!taskId) return false;

    try {
      const success = await deleteTask(taskId);
      if (success) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
        toast.success("Task deleted");
      }
      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete task";
      console.error("Failed to delete task:", err);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        isLoading,
        error,
        createCardTask,
        updateCardTask,
        deleteCardTask,
        refreshTasks,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}
