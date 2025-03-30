"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Plus } from "lucide-react";
import { Task } from "./Task";
import { useTasks, TasksProvider } from "~/hooks/useTasks";
import { LabelsProvider } from "~/hooks/useLabels";
import TaskDialogTest from "./TaskDialogTest";

interface TaskListProps {
  projectCardId: string;
  boardId: string;
}

function TaskListContent() {
  const {
    tasks,
    isLoading,
    error,
    createCardTask,
    updateCardTask,
    deleteCardTask,
  } = useTasks();
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    setIsCreatingTask(true);
    try {
      await createCardTask(newTaskTitle, newTaskDescription || undefined);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setShowNewTaskForm(false);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    await updateCardTask(taskId, {
      status: status as "todo" | "in-progress" | "completed",
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteCardTask(taskId);
  };

  const handleUpdateTask = async (
    taskId: string,
    data: { title?: string; description?: string | null },
  ) => {
    await updateCardTask(taskId, data);
  };

  return (
    <div className="mt-4 space-y-3">
      <h3 className="font-medium">Tasks</h3>

      {/* Test Dialog Component */}
      <TaskDialogTest />

      {isLoading ? (
        <div className="text-muted-foreground py-4 text-center text-sm">
          Loading tasks...
        </div>
      ) : error ? (
        <div className="py-4 text-center text-sm text-red-500">{error}</div>
      ) : tasks.length === 0 && !showNewTaskForm ? (
        <div className="text-muted-foreground py-4 text-center text-sm">
          No tasks yet. Add one below.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Task
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              status={task.status}
              boardId={task.projectCardId}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          ))}
        </div>
      )}

      {showNewTaskForm ? (
        <div className="space-y-2 rounded-md border p-3">
          <Input
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="text-sm"
            autoFocus
          />
          <Textarea
            placeholder="Description (optional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleCreateTask}
              disabled={!newTaskTitle.trim() || isCreatingTask}
            >
              {isCreatingTask ? "Adding..." : "Add Task"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowNewTaskForm(false);
                setNewTaskTitle("");
                setNewTaskDescription("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowNewTaskForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      )}
    </div>
  );
}

export default function TaskList({ projectCardId, boardId }: TaskListProps) {
  return (
    <LabelsProvider boardId={boardId}>
      <TasksProvider projectCardId={projectCardId} boardId={boardId}>
        <TaskListContent />
      </TasksProvider>
    </LabelsProvider>
  );
}
