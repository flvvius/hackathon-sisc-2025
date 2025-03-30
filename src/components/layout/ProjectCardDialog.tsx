"use client";

import { useState } from "react";
import {
  type Card,
  type Task,
  type Contributor,
  type Comment,
  labelColors,
} from "./KanbanBoard";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import {
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  CalendarIcon,
} from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface ProjectCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card;
  onUpdate: (updatedCard: Omit<Card, "id">) => void;
  onDelete: () => void;
  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTask: (taskId: string, updatedTask: Omit<Task, "id">) => void;
  onDeleteTask: (taskId: string) => void;
  onAddContributor: (contributor: Omit<Contributor, "id">) => void;
  onAddComment: (comment: Omit<Comment, "id" | "createdAt">) => void;
}

export default function ProjectCardDialog({
  open,
  onOpenChange,
  card,
  onUpdate,
  onDelete,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddContributor,
  onAddComment,
}: ProjectCardDialogProps) {
  const [activeTab, setActiveTab] = useState("details");

  // Project details
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [labels, setLabels] = useState<{ text: string; color: string }[]>(
    card.labels ?? [],
  );
  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("purple");
  const [showLabelInput, setShowLabelInput] = useState(false);

  // New task
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<
    "todo" | "in-progress" | "completed"
  >("todo");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(
    undefined,
  );
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  // New contributor
  const [newContributorName, setNewContributorName] = useState("");
  const [newContributorRole, setNewContributorRole] = useState("");
  const [showNewContributorForm, setShowNewContributorForm] = useState(false);

  // New comment
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [showNewCommentForm, setShowNewCommentForm] = useState(false);

  // Calculate task completion percentage
  const getTaskCompletionPercentage = () => {
    if (!card.tasks || card.tasks.length === 0) return 0;
    const completedTasks = card.tasks.filter(
      (task) => task.status === "completed",
    );
    return Math.round((completedTasks.length / card.tasks.length) * 100);
  };

  const handleUpdateProject = () => {
    onUpdate({
      ...card,
      title,
      description,
      labels,
    });
  };

  const addLabel = () => {
    if (
      newLabelText.trim() &&
      !labels.some((label) => label.text === newLabelText.trim().toLowerCase())
    ) {
      const updatedLabels = [
        ...labels,
        {
          text: newLabelText.trim().toLowerCase(),
          color: newLabelColor,
        },
      ];
      setLabels(updatedLabels);
      onUpdate({
        ...card,
        title,
        description,
        labels: updatedLabels,
      });
      setNewLabelText("");
      setShowLabelInput(false);
    }
  };

  const removeLabel = (labelToRemove: string) => {
    const updatedLabels = labels.filter(
      (label) => label.text !== labelToRemove,
    );
    setLabels(updatedLabels);
    onUpdate({
      ...card,
      title,
      description,
      labels: updatedLabels,
    });
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask({
        title: newTaskTitle,
        description: newTaskDescription,
        status: newTaskStatus,
        assignees: [],
        dueDate: newTaskDueDate
          ? format(newTaskDueDate, "yyyy-MM-dd")
          : undefined,
        labels: [],
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskStatus("todo");
      setNewTaskDueDate(undefined);
      setShowNewTaskForm(false);
    }
  };

  const handleUpdateTaskStatus = (
    taskId: string,
    newStatus: "todo" | "in-progress" | "completed",
  ) => {
    const task = card.tasks?.find((t) => t.id === taskId);
    if (task) {
      onUpdateTask(taskId, {
        ...task,
        status: newStatus,
      });
    }
  };

  const handleAddContributor = () => {
    if (newContributorName.trim() && newContributorRole.trim()) {
      onAddContributor({
        name: newContributorName,
        role: newContributorRole,
      });
      setNewContributorName("");
      setNewContributorRole("");
      setShowNewContributorForm(false);
    }
  };

  const handleAddComment = () => {
    if (newCommentAuthor.trim() && newCommentText.trim()) {
      onAddComment({
        author: newCommentAuthor,
        text: newCommentText,
      });
      setNewCommentAuthor("");
      setNewCommentText("");
      setShowNewCommentForm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{card.title}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tasks">
              Tasks {card.tasks ? `(${card.tasks.length})` : "(0)"}
            </TabsTrigger>
            <TabsTrigger value="team">Team & Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleUpdateProject}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleUpdateProject}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Labels</Label>
                {!showLabelInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLabelInput(true)}
                    className="h-7 px-2"
                  >
                    <Tag className="mr-1 h-3.5 w-3.5" />
                    Add
                  </Button>
                )}
              </div>
              {showLabelInput && (
                <div className="grid gap-2">
                  <div className="flex gap-2">
                    <Input
                      value={newLabelText}
                      onChange={(e) => setNewLabelText(e.target.value)}
                      placeholder="Enter label name"
                      className="h-8"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addLabel();
                        if (e.key === "Escape") {
                          setShowLabelInput(false);
                          setNewLabelText("");
                        }
                      }}
                      autoFocus
                    />
                    <Select
                      value={newLabelColor}
                      onValueChange={setNewLabelColor}
                    >
                      <SelectTrigger className="h-8 w-[100px]">
                        <SelectValue placeholder="Color" />
                      </SelectTrigger>
                      <SelectContent>
                        {labelColors.map((color) => (
                          <SelectItem key={color.name} value={color.name}>
                            <div className="flex items-center">
                              <div
                                className={`h-3 w-3 rounded-full ${color.bg} mr-2`}
                              ></div>
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8" onClick={addLabel}>
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setShowLabelInput(false);
                        setNewLabelText("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              <div className="mt-1 flex flex-wrap gap-1">
                {labels.map((label, index) => {
                  const colorConfig =
                    labelColors.find((c) => c.name === label.color) ??
                    labelColors[7]; // Default to gray
                  return (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`${colorConfig?.bg} ${colorConfig?.text} border-0 hover:${colorConfig?.bg}`}
                    >
                      {label.text}
                      <button
                        className="ml-1 hover:text-red-500"
                        onClick={() => removeLabel(label.text)}
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
                {labels.length === 0 && (
                  <span className="text-muted-foreground text-xs">
                    No labels added yet
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Tasks</h3>
              <div className="text-muted-foreground text-sm">
                {card.tasks
                  ? `${card.tasks.filter((t) => t.status === "completed").length}/${card.tasks.length} completed`
                  : "0/0 completed"}{" "}
                ({getTaskCompletionPercentage()}%)
              </div>
            </div>

            {/* Task list */}
            <div className="space-y-2">
              {card.tasks && card.tasks.length > 0 ? (
                card.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-muted/30 rounded-lg border p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() =>
                            handleUpdateTaskStatus(
                              task.id,
                              task.status === "completed"
                                ? "todo"
                                : task.status === "todo"
                                  ? "in-progress"
                                  : "completed",
                            )
                          }
                          className="mt-0.5"
                        >
                          {task.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : task.status === "in-progress" ? (
                            <Clock className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Circle className="text-muted-foreground h-5 w-5" />
                          )}
                        </button>
                        <div>
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <p className="text-muted-foreground text-xs">
                            {task.description}
                          </p>

                          {task.dueDate && (
                            <div className="text-muted-foreground mt-1 flex items-center text-xs">
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}

                          {task.labels && task.labels.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {task.labels.map((label, index) => {
                                const colorConfig =
                                  labelColors.find(
                                    (c) => c.name === label.color,
                                  ) ?? labelColors[7];
                                return (
                                  <span
                                    key={index}
                                    className={`${colorConfig?.bg} ${colorConfig?.text} rounded-full px-1.5 py-0.5 text-xs`}
                                  >
                                    {label.text}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center">
                        {task.assignees && task.assignees.length > 0 && (
                          <div className="mr-2 flex -space-x-2 overflow-hidden">
                            {task.assignees.map((assignee, index) => (
                              <Avatar
                                key={index}
                                className="border-background h-5 w-5 border-2"
                              >
                                <AvatarFallback className="bg-purple-100 text-[8px] text-purple-700">
                                  {assignee.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
                          onClick={() => onDeleteTask(task.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground py-6 text-center">
                  No tasks added yet
                </div>
              )}
            </div>

            {/* Add new task */}
            {showNewTaskForm ? (
              <div className="space-y-3 rounded-lg border p-3">
                <h4 className="text-sm font-medium">Add New Task</h4>
                <div className="grid gap-2">
                  <Label htmlFor="new-task-title">Title</Label>
                  <Input
                    id="new-task-title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-task-description">Description</Label>
                  <Textarea
                    id="new-task-description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Enter task description"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="new-task-status">Status</Label>
                    <select
                      id="new-task-status"
                      value={newTaskStatus}
                      onChange={(e) =>
                        setNewTaskStatus(
                          e.target.value as
                            | "todo"
                            | "in-progress"
                            | "completed",
                        )
                      }
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-9 justify-start text-left text-sm font-normal"
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                          {newTaskDueDate
                            ? format(newTaskDueDate, "PPP")
                            : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newTaskDueDate}
                          onSelect={setNewTaskDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewTaskForm(false);
                      setNewTaskTitle("");
                      setNewTaskDescription("");
                      setNewTaskStatus("todo");
                      setNewTaskDueDate(undefined);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddTask}
                    disabled={!newTaskTitle.trim()}
                  >
                    Add Task
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="flex w-full items-center justify-center gap-1"
                onClick={() => setShowNewTaskForm(true)}
              >
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            )}
          </TabsContent>

          <TabsContent value="team" className="mt-4 space-y-4">
            {/* Contributors section */}
            <div>
              <h3 className="mb-3 text-lg font-medium">Team Members</h3>

              <div className="space-y-2">
                {card.contributors && card.contributors.length > 0 ? (
                  card.contributors.map((contributor, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border p-2"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {contributor.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {contributor.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {contributor.role}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground py-4 text-center">
                    No team members added yet
                  </div>
                )}
              </div>

              {/* Add new contributor */}
              {showNewContributorForm ? (
                <div className="mt-3 space-y-3 rounded-lg border p-3">
                  <h4 className="text-sm font-medium">Add Team Member</h4>
                  <div className="grid gap-2">
                    <Label htmlFor="new-contributor-name">Name</Label>
                    <Input
                      id="new-contributor-name"
                      value={newContributorName}
                      onChange={(e) => setNewContributorName(e.target.value)}
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-contributor-role">Role</Label>
                    <Input
                      id="new-contributor-role"
                      value={newContributorRole}
                      onChange={(e) => setNewContributorRole(e.target.value)}
                      placeholder="Enter role"
                    />
                  </div>
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewContributorForm(false);
                        setNewContributorName("");
                        setNewContributorRole("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddContributor}
                      disabled={
                        !newContributorName.trim() || !newContributorRole.trim()
                      }
                    >
                      Add Member
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="mt-3 flex w-full items-center justify-center gap-1"
                  onClick={() => setShowNewContributorForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Team Member
                </Button>
              )}
            </div>

            <Separator className="my-4" />

            {/* Comments section */}
            <div>
              <h3 className="mb-3 text-lg font-medium">Comments</h3>

              <div className="space-y-3">
                {card.comments && card.comments.length > 0 ? (
                  card.comments.map((comment, index) => (
                    <div
                      key={index}
                      className="bg-muted/30 rounded-lg border p-3"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-100 text-[10px] text-blue-700">
                            {comment.author.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium">
                            {comment.author}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="ml-8 text-sm">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground py-4 text-center">
                    No comments yet
                  </div>
                )}
              </div>

              {/* Add new comment */}
              {showNewCommentForm ? (
                <div className="mt-3 space-y-3 rounded-lg border p-3">
                  <h4 className="text-sm font-medium">Add Comment</h4>
                  <div className="grid gap-2">
                    <Label htmlFor="new-comment-author">Your Name</Label>
                    <Input
                      id="new-comment-author"
                      value={newCommentAuthor}
                      onChange={(e) => setNewCommentAuthor(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-comment-text">Comment</Label>
                    <Textarea
                      id="new-comment-text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Enter your comment"
                      rows={3}
                    />
                  </div>
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowNewCommentForm(false);
                        setNewCommentAuthor("");
                        setNewCommentText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={
                        !newCommentAuthor.trim() || !newCommentText.trim()
                      }
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="mt-3 flex w-full items-center justify-center gap-1"
                  onClick={() => setShowNewCommentForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Comment
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 flex justify-between sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onDelete();
              onOpenChange(false);
            }}
            className="mr-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
