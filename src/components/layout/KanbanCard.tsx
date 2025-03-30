"use client";

import { useRef, useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import {
  CheckCircle2,
  Clock,
  Circle,
  MessageSquare,
  Pencil,
  Trash2,
  UserCircle,
  Github,
  GitBranch,
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import TaskLabelPicker from "~/components/project/TaskLabelPicker";
import TaskAssignees from "~/components/project/TaskAssignees";
import { BoardMembersProvider } from "~/hooks/useBoardMembers";
import type { CardItem, UserInfo } from "~/lib/types";

// Define label colors with fixed types
const labelColors = [
  { name: "green", bg: "bg-green-100", text: "text-green-700" },
  { name: "red", bg: "bg-red-100", text: "text-red-700" },
  { name: "blue", bg: "bg-blue-100", text: "text-blue-700" },
  { name: "yellow", bg: "bg-yellow-100", text: "text-yellow-700" },
  { name: "purple", bg: "bg-purple-100", text: "text-purple-700" },
  { name: "pink", bg: "bg-pink-100", text: "text-pink-700" },
  { name: "indigo", bg: "bg-indigo-100", text: "text-indigo-700" },
  { name: "gray", bg: "bg-gray-100", text: "text-gray-700" },
] as const;

// Helper function to get color config
function getColorConfig(colorName: string | undefined) {
  // Default to gray (the last color)
  const defaultColor = labelColors[7];

  if (!colorName) return defaultColor;

  // Find matching color or use default
  return labelColors.find((c) => c.name === colorName) ?? defaultColor;
}

// Helper to get initials from name
const getInitials = (name: string | null | undefined) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Helper to render assignee avatar with GitHub/GitLab username tags
const AssigneeAvatar = ({ assignee }: { assignee: UserInfo }) => {
  return (
    <div className="group relative">
      <Avatar className="border-background h-5 w-5 border">
        <AvatarImage
          src={assignee.imageUrl ?? undefined}
          alt={assignee.name ?? "User"}
        />
        <AvatarFallback className="text-[8px]">
          {getInitials(assignee.name)}
        </AvatarFallback>
      </Avatar>

      {/* GitHub/GitLab username tooltip on hover */}
      {(assignee.githubUsername || assignee.gitlabUsername) && (
        <div className="absolute -bottom-8 left-1/2 z-50 hidden -translate-x-1/2 transform flex-col items-center group-hover:flex">
          <div className="rounded bg-black p-1 text-[9px] whitespace-nowrap text-white shadow">
            {assignee.githubUsername && (
              <div className="flex items-center">
                <Github className="mr-1 h-2.5 w-2.5" />@
                {assignee.githubUsername}
              </div>
            )}
            {assignee.gitlabUsername && (
              <div className="mt-0.5 flex items-center">
                <GitBranch className="mr-1 h-2.5 w-2.5" />@
                {assignee.gitlabUsername}
              </div>
            )}
          </div>
          <div className="-mt-1 h-2 w-2 rotate-45 bg-black"></div>
        </div>
      )}

      {/* Badge indicator for GitHub/GitLab */}
      {(assignee.githubUsername || assignee.gitlabUsername) && (
        <div className="bg-background absolute -right-1 -bottom-1 flex h-2.5 w-2.5 items-center justify-center rounded-full">
          <span className="text-[7px] font-bold">@</span>
        </div>
      )}
    </div>
  );
};

interface KanbanCardProps {
  card: CardItem;
  listId: string;
  boardId: string;
  updateCard: (
    cardId: string,
    data: Partial<CardItem> & { _shouldSort?: boolean },
  ) => void;
  deleteCard: () => void;
}

export default function KanbanCard({
  card,
  listId,
  boardId,
  updateCard,
  deleteCard,
}: KanbanCardProps) {
  // Local dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(
    card.description ?? "",
  );
  const [editStatus, setEditStatus] = useState(card.status ?? "todo");
  const [editLabels, setEditLabels] = useState(card.labels ?? []);
  const [editAssignees, setEditAssignees] = useState<UserInfo[]>(
    card.assignees ?? [],
  );

  // Create a ref for the drag element
  const cardRef = useRef<HTMLDivElement>(null);

  // Set up drag source
  const [{ isDragging }, connectDrag] = useDrag({
    type: "CARD",
    item: { id: card.id, listId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Connect the drag ref
  connectDrag(cardRef);

  // Handle opening the dialog - reset form values
  const handleOpenDialog = () => {
    setEditTitle(card.title);
    setEditDescription(card.description ?? "");
    setEditStatus(card.status ?? "todo");
    setEditLabels(card.labels ?? []);
    setEditAssignees(card.assignees ?? []);
    setIsDialogOpen(true);
  };

  // Handle saving the dialog changes
  const handleSaveChanges = () => {
    if (!editTitle.trim()) return;

    // Check if status has changed
    const statusChanged = editStatus !== (card.status ?? "todo");

    updateCard(card.id, {
      title: editTitle,
      description: editDescription,
      status: editStatus,
      labels: editLabels,
      assignees: editAssignees,
      _shouldSort: statusChanged, // Only sort if status has changed
    });

    setIsDialogOpen(false);
  };

  // Handle deleting the card
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCard();
  };

  // Toggle status without opening dialog
  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    const currentStatus = card.status ?? "todo";
    let newStatus: "todo" | "in-progress" | "completed";

    switch (currentStatus) {
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

    // Update the card with new status and a special flag to trigger sorting
    updateCard(card.id, {
      status: newStatus,
      _shouldSort: true, // Special flag to indicate sorting should happen
    });
  };

  // Status icon based on current status
  const StatusIcon = () => {
    const currentStatus = card.status ?? "todo";
    switch (currentStatus) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`rounded-lg border bg-white p-3 shadow-sm transition-all duration-200 hover:shadow ${
          isDragging ? "rotate-1 opacity-50" : ""
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <button
              onClick={handleStatusToggle}
              className="hover:bg-muted/50 mt-0.5 rounded-full p-1"
              title={`Status: ${card.status ?? "todo"}`}
            >
              <StatusIcon />
            </button>
            <div>
              <h4 className="text-sm font-medium">{card.title}</h4>
              {card.description && (
                <p className="text-muted-foreground mt-1 ml-1 line-clamp-2 text-xs">
                  {card.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleOpenDialog}
              title="Edit task"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive h-6 w-6 p-0"
              onClick={handleDelete}
              title="Delete task"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.labels.map((label, index) => {
                const colorConfig = getColorConfig(label.color);
                return (
                  <span
                    key={index}
                    className={`${colorConfig.bg} ${colorConfig.text} rounded-full px-2 py-0.5 text-xs`}
                  >
                    {label.text}
                  </span>
                );
              })}
            </div>
          )}

          {/* Assignees */}
          {card.assignees && card.assignees.length > 0 && (
            <div className="flex items-center gap-1">
              <UserCircle className="text-muted-foreground h-3.5 w-3.5" />
              <div className="flex -space-x-2">
                {card.assignees.slice(0, 3).map((assignee) => (
                  <AssigneeAvatar key={assignee.id} assignee={assignee} />
                ))}
                {card.assignees.length > 3 && (
                  <div className="border-background bg-muted flex h-5 w-5 items-center justify-center rounded-full border text-[8px] font-medium">
                    +{card.assignees.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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

            <TaskLabelPicker
              labels={editLabels}
              onLabelsChange={setEditLabels}
            />

            <BoardMembersProvider boardId={boardId}>
              <TaskAssignees
                boardId={boardId}
                assignees={editAssignees}
                onChange={setEditAssignees}
              />
            </BoardMembersProvider>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex space-x-2">
                <Button
                  variant={editStatus === "todo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditStatus("todo")}
                >
                  <Circle className="mr-1 h-4 w-4" /> To Do
                </Button>
                <Button
                  variant={editStatus === "in-progress" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditStatus("in-progress")}
                >
                  <Clock className="mr-1 h-4 w-4" /> In Progress
                </Button>
                <Button
                  variant={editStatus === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditStatus("completed")}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Completed
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={!editTitle.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
