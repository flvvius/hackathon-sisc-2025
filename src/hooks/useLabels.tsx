"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";
import type { Label } from "~/server/actions/labels";
import {
  getBoardLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  addLabelToTask,
  removeLabelFromTask,
  getTaskLabels,
  addLabelToProject,
  removeLabelFromProject,
  getProjectLabels,
} from "~/server/actions/labels";

interface LabelsContextType {
  labels: Label[];
  isLoading: boolean;
  error: string | null;
  createBoardLabel: (text: string, color: string) => Promise<Label | null>;
  updateBoardLabel: (
    labelId: string,
    data: { text?: string; color?: string },
  ) => Promise<Label | null>;
  deleteBoardLabel: (labelId: string) => Promise<boolean>;
  refreshLabels: () => Promise<void>;
  // Task labels
  addLabelToTask: (taskId: string, labelId: string) => Promise<boolean>;
  removeLabelFromTask: (taskId: string, labelId: string) => Promise<boolean>;
  getTaskLabels: (taskId: string) => Promise<Label[]>;
  // Project labels
  addLabelToProject: (projectId: string, labelId: string) => Promise<boolean>;
  removeLabelFromProject: (
    projectId: string,
    labelId: string,
  ) => Promise<boolean>;
  getProjectLabels: (projectId: string) => Promise<Label[]>;
}

// Predefined colors for labels
export const LABEL_COLORS = [
  { name: "red", bg: "bg-red-100", text: "text-red-800" },
  { name: "green", bg: "bg-green-100", text: "text-green-800" },
  { name: "blue", bg: "bg-blue-100", text: "text-blue-800" },
  { name: "yellow", bg: "bg-yellow-100", text: "text-yellow-800" },
  { name: "purple", bg: "bg-purple-100", text: "text-purple-800" },
  { name: "pink", bg: "bg-pink-100", text: "text-pink-800" },
  { name: "indigo", bg: "bg-indigo-100", text: "text-indigo-800" },
  { name: "gray", bg: "bg-gray-100", text: "text-gray-800" },
];

const LabelsContext = createContext<LabelsContextType | null>(null);

export const LabelsProvider = ({
  children,
  boardId,
}: {
  children: React.ReactNode;
  boardId: string;
}) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLabels = useCallback(async () => {
    if (!boardId) return;

    setIsLoading(true);
    setError(null);
    try {
      const boardLabels = await getBoardLabels(boardId);
      setLabels(boardLabels);
    } catch (err) {
      console.error("Failed to fetch board labels:", err);
      setError("Failed to load board labels");
      toast.error("Failed to load board labels");
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    void refreshLabels();
  }, [refreshLabels]);

  const createBoardLabel = useCallback(
    async (text: string, color: string) => {
      if (!boardId || !text.trim() || !color.trim()) return null;

      try {
        const newLabel = await createLabel(boardId, text, color);
        if (newLabel) {
          setLabels((prev) => [...prev, newLabel]);
          toast.success(`Label '${text}' created`);
        }
        return newLabel;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create label";
        console.error("Failed to create label:", err);
        toast.error(errorMessage);
        return null;
      }
    },
    [boardId],
  );

  const updateBoardLabel = useCallback(
    async (labelId: string, data: { text?: string; color?: string }) => {
      if (!labelId) return null;

      try {
        const updatedLabel = await updateLabel(labelId, data);
        if (updatedLabel) {
          setLabels((prev) =>
            prev.map((label) => (label.id === labelId ? updatedLabel : label)),
          );
          toast.success("Label updated");
        }
        return updatedLabel;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update label";
        console.error("Failed to update label:", err);
        toast.error(errorMessage);
        return null;
      }
    },
    [],
  );

  const deleteBoardLabel = useCallback(async (labelId: string) => {
    if (!labelId) return false;

    try {
      const success = await deleteLabel(labelId);
      if (success) {
        setLabels((prev) => prev.filter((label) => label.id !== labelId));
        toast.success("Label deleted");
      }
      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete label";
      console.error("Failed to delete label:", err);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Wrap the imported functions for task and project labels
  const addTaskLabel = useCallback(async (taskId: string, labelId: string) => {
    try {
      const success = await addLabelToTask(taskId, labelId);
      if (success) {
        toast.success("Label added to task");
      }
      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add label to task";
      console.error("Failed to add label to task:", err);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const removeTaskLabel = useCallback(
    async (taskId: string, labelId: string) => {
      try {
        const success = await removeLabelFromTask(taskId, labelId);
        if (success) {
          toast.success("Label removed from task");
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to remove label from task";
        console.error("Failed to remove label from task:", err);
        toast.error(errorMessage);
        return false;
      }
    },
    [],
  );

  const fetchTaskLabels = useCallback(async (taskId: string) => {
    try {
      return await getTaskLabels(taskId);
    } catch (err) {
      console.error("Failed to fetch task labels:", err);
      return [];
    }
  }, []);

  const addProjectLabel = useCallback(
    async (projectId: string, labelId: string) => {
      try {
        const success = await addLabelToProject(projectId, labelId);
        if (success) {
          toast.success("Label added to project");
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add label to project";
        console.error("Failed to add label to project:", err);
        toast.error(errorMessage);
        return false;
      }
    },
    [],
  );

  const removeProjectLabel = useCallback(
    async (projectId: string, labelId: string) => {
      try {
        const success = await removeLabelFromProject(projectId, labelId);
        if (success) {
          toast.success("Label removed from project");
        }
        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to remove label from project";
        console.error("Failed to remove label from project:", err);
        toast.error(errorMessage);
        return false;
      }
    },
    [],
  );

  const fetchProjectLabels = useCallback(async (projectId: string) => {
    try {
      return await getProjectLabels(projectId);
    } catch (err) {
      console.error("Failed to fetch project labels:", err);
      return [];
    }
  }, []);

  return (
    <LabelsContext.Provider
      value={{
        labels,
        isLoading,
        error,
        createBoardLabel,
        updateBoardLabel,
        deleteBoardLabel,
        refreshLabels,
        addLabelToTask: addTaskLabel,
        removeLabelFromTask: removeTaskLabel,
        getTaskLabels: fetchTaskLabels,
        addLabelToProject: addProjectLabel,
        removeLabelFromProject: removeProjectLabel,
        getProjectLabels: fetchProjectLabels,
      }}
    >
      {children}
    </LabelsContext.Provider>
  );
};

export function useLabels() {
  const context = useContext(LabelsContext);
  if (!context) {
    throw new Error("useLabels must be used within a LabelsProvider");
  }
  return context;
}
