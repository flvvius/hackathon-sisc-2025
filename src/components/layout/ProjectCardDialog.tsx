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
import TaskList from "~/components/project/TaskList";
import { LabelsProvider } from "~/hooks/useLabels";

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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="mr-8 text-xl font-semibold">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-[3fr,1fr] gap-6">
          <div>
            {/* Main content area */}
            <Tabs
              defaultValue="details"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              {/* Details tab */}
              <TabsContent value="details" className="pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Project title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Project description"
                      rows={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Labels</Label>
                    <div className="flex flex-wrap gap-2">
                      {labels.map((label, i) => {
                        const colorConfig =
                          labelColors.find((c) => c.name === label.color) ??
                          labelColors[7]; // Default to gray
                        return (
                          <Badge
                            key={i}
                            className={`${colorConfig.bg} ${colorConfig.text} gap-1 hover:${colorConfig.bg}`}
                          >
                            {label.text}
                            <button
                              className="ml-1 opacity-70 hover:opacity-100"
                              onClick={() => removeLabel(label.text)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                      {!showLabelInput && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6"
                          onClick={() => setShowLabelInput(true)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add label
                        </Button>
                      )}
                    </div>

                    {showLabelInput && (
                      <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="text-xs">Label text</div>
                          <Input
                            value={newLabelText}
                            onChange={(e) => setNewLabelText(e.target.value)}
                            className="h-8"
                            placeholder="Enter label text"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs">Color</div>
                          <Select
                            value={newLabelColor}
                            onValueChange={setNewLabelColor}
                          >
                            <SelectTrigger className="h-8 w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {labelColors.map((color) => (
                                <SelectItem key={color.name} value={color.name}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`h-3 w-3 rounded-full ${color.bg}`}
                                    ></div>
                                    <span>
                                      {color.name.charAt(0).toUpperCase() +
                                        color.name.slice(1)}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={addLabel}
                            disabled={!newLabelText.trim()}
                          >
                            Add
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setShowLabelInput(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleUpdateProject}
                    disabled={!title.trim()}
                    className="w-full"
                  >
                    Save Changes
                  </Button>
                </div>
              </TabsContent>

              {/* Tasks tab */}
              <TabsContent value="tasks" className="pt-4">
                <LabelsProvider boardId={card.boardId || "default"}>
                  <TaskList
                    projectCardId={card.id}
                    boardId={card.boardId || "default"}
                  />
                </LabelsProvider>
              </TabsContent>

              {/* Team tab */}
              <TabsContent value="team" className="pt-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Team Members</h3>

                  {card.contributors && card.contributors.length > 0 ? (
                    <div className="space-y-2">
                      {card.contributors.map((contributor, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-purple-100 text-sm text-purple-700">
                                {contributor.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {contributor.name}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {contributor.role}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-6 text-center">
                      No team members added yet.
                    </div>
                  )}

                  {showNewContributorForm ? (
                    <div className="space-y-3 rounded-md border p-3">
                      <div className="space-y-2">
                        <Label htmlFor="contributorName">Name</Label>
                        <Input
                          id="contributorName"
                          value={newContributorName}
                          onChange={(e) =>
                            setNewContributorName(e.target.value)
                          }
                          placeholder="Team member name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contributorRole">Role</Label>
                        <Input
                          id="contributorRole"
                          value={newContributorRole}
                          onChange={(e) =>
                            setNewContributorRole(e.target.value)
                          }
                          placeholder="e.g. Designer, Developer"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={handleAddContributor}
                          disabled={
                            !newContributorName.trim() ||
                            !newContributorRole.trim()
                          }
                        >
                          Add Member
                        </Button>
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
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowNewContributorForm(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Team Member
                    </Button>
                  )}
                </div>
              </TabsContent>

              {/* Comments tab */}
              <TabsContent value="comments" className="pt-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Discussion</h3>

                  {card.comments && card.comments.length > 0 ? (
                    <div className="space-y-3">
                      {card.comments.map((comment, i) => (
                        <div
                          key={i}
                          className="rounded-md border p-3 shadow-sm"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-blue-100 text-[10px] text-blue-700">
                                {comment.author.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {comment.author}
                            </span>
                            {comment.createdAt && (
                              <span className="text-muted-foreground text-xs">
                                {new Date(
                                  comment.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground py-6 text-center">
                      No comments yet. Start the discussion!
                    </div>
                  )}

                  {showNewCommentForm ? (
                    <div className="space-y-3 rounded-md border p-3">
                      <div className="space-y-2">
                        <Label htmlFor="commentAuthor">Your Name</Label>
                        <Input
                          id="commentAuthor"
                          value={newCommentAuthor}
                          onChange={(e) => setNewCommentAuthor(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="commentText">Comment</Label>
                        <Textarea
                          id="commentText"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Write your comment..."
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={handleAddComment}
                          disabled={
                            !newCommentAuthor.trim() || !newCommentText.trim()
                          }
                        >
                          Post Comment
                        </Button>
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
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowNewCommentForm(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Comment
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            {/* Sidebar */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Status</h4>
              <div className="flex items-center gap-1">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-green-500">
                  <div
                    className="h-full bg-green-200"
                    style={{
                      width: `${100 - getTaskCompletionPercentage()}%`,
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium">
                  {getTaskCompletionPercentage()}%
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2 text-sm font-medium">Team</h4>
              {card.contributors && card.contributors.length > 0 ? (
                <div className="flex -space-x-2 overflow-hidden">
                  {card.contributors.slice(0, 5).map((contributor, i) => (
                    <Avatar
                      key={i}
                      className="border-background h-8 w-8 border-2"
                    >
                      <AvatarFallback className="bg-purple-100 text-xs text-purple-700">
                        {contributor.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {card.contributors.length > 5 && (
                    <div className="border-background bg-muted flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium">
                      +{card.contributors.length - 5}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-muted-foreground text-xs">
                  No team members yet
                </div>
              )}
            </div>

            <Separator />

            <div>
              <h4 className="mb-2 text-sm font-medium">Labels</h4>
              {labels.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {labels.map((label, i) => {
                    const colorConfig =
                      labelColors.find((c) => c.name === label.color) ??
                      labelColors[7];
                    return (
                      <span
                        key={i}
                        className={`${colorConfig.bg} ${colorConfig.text} inline-flex rounded-full px-2 py-0.5 text-xs`}
                      >
                        {label.text}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted-foreground text-xs">
                  No labels yet
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
