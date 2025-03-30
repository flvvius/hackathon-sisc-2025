"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Trash2, Check, Circle, Clock } from "lucide-react";
import { useLabels, LABEL_COLORS } from "~/hooks/useLabels";
import TaskLabelPicker from "./TaskLabelPicker";
import type { Label } from "~/server/actions/labels";

export interface TaskProps {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in-progress" | "completed";
  boardId: string;
  onStatusChange: (taskId: string, status: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onUpdateTask?: (
    taskId: string,
    data: { title?: string; description?: string | null },
  ) => Promise<void>;
}

export function Task({
  id,
  title,
  description,
  status,
  boardId,
  onStatusChange,
  onDeleteTask,
  onUpdateTask,
}: TaskProps) {
  const [taskLabels, setTaskLabels] = useState<Label[]>([]);
  const [open, setOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const { getTaskLabels } = useLabels();

  // Log dialog state changes for debugging
  useEffect(() => {
    console.log("Dialog state changed:", open);
  }, [open]);

  // Update local state when props change
  useEffect(() => {
    setEditTitle(title);
    setEditDescription(description ?? "");
  }, [title, description]);

  // Load task's labels
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const labels = await getTaskLabels(id);
        setTaskLabels(labels);
      } catch (error) {
        console.error("Failed to load task labels:", error);
      }
    };

    void fetchLabels();
  }, [id, getTaskLabels]);

  // Status icon based on current status
  const StatusIcon = () => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  // Cycle through statuses: todo -> in-progress -> completed -> todo
  const cycleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the dialog

    let newStatus: "todo" | "in-progress" | "completed";

    switch (status) {
      case "todo":
        newStatus = "in-progress";
        break;
      case "in-progress":
        newStatus = "completed";
        break;
      case "completed":
        newStatus = "todo";
        break;
      default:
        newStatus = "todo";
    }

    await onStatusChange(id, newStatus);
  };

  // Helper to get color info
  const getColorConfig = (colorName: string) => {
    return (
      LABEL_COLORS.find((c) => c.name === colorName) ??
      LABEL_COLORS[LABEL_COLORS.length - 1]
    );
  };

  const handleSaveTask = async () => {
    if (!onUpdateTask || !editTitle.trim()) return;

    setIsSaving(true);
    try {
      await onUpdateTask(id, {
        title: editTitle,
        description: editDescription || null,
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dialog opening
    void onDeleteTask(id);
  };

  const openDialog = useCallback(() => {
    console.log("Opening dialog");
    setOpen(true);
  }, []);

  return (
    <>
      <Card className="mb-2 shadow-sm">
        <CardHeader className="p-3 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <button
                onClick={cycleStatus}
                className="hover:bg-muted/50 mt-0.5 rounded-full p-1"
                title={`Status: ${status}`}
              >
                <StatusIcon />
              </button>
              <h4 className="text-sm font-medium">{title}</h4>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 px-2 py-1"
                onClick={openDialog}
                title="Edit task"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-pencil"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
                <span className="text-xs">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                onClick={handleDelete}
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {(description ?? taskLabels.length > 0) && (
          <CardContent className="p-3 pt-1">
            {taskLabels.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {taskLabels.map((label) => {
                  const colorConfig = getColorConfig(label.color);
                  return (
                    <span
                      key={label.id}
                      className={`${colorConfig?.bg ?? ""} ${colorConfig?.text ?? ""} rounded-full px-2 py-0.5 text-xs`}
                    >
                      {label.text}
                    </span>
                  );
                })}
              </div>
            )}

            {description && (
              <p className="text-muted-foreground ml-6 text-xs">
                {description}
              </p>
            )}
          </CardContent>
        )}

        <CardFooter className="flex justify-end p-2">
          <TaskLabelPicker
            taskId={id}
            boardId={boardId}
            onLabelsChange={setTaskLabels}
          />
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Task description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex space-x-2">
                <Button
                  variant={status === "todo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onStatusChange(id, "todo")}
                >
                  <Circle className="mr-1 h-4 w-4" /> To Do
                </Button>
                <Button
                  variant={status === "in-progress" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onStatusChange(id, "in-progress")}
                >
                  <Clock className="mr-1 h-4 w-4" /> In Progress
                </Button>
                <Button
                  variant={status === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onStatusChange(id, "completed")}
                >
                  <Check className="mr-1 h-4 w-4" /> Completed
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Labels</label>
              <TaskLabelPicker
                taskId={id}
                boardId={boardId}
                onLabelsChange={setTaskLabels}
                variant="inline"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {onUpdateTask && (
              <Button
                onClick={handleSaveTask}
                disabled={!editTitle.trim() || isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
