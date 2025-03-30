"use client";

import { useState, useRef } from "react";
import { useDrag } from "react-dnd";
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
import {
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import ProjectCardDialog from "./ProjectCardDialog";

interface KanbanCardProps {
  card: Card;
  listId: string;
  updateCard: (updatedCard: Omit<Card, "id">) => void;
  deleteCard: () => void;
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (taskId: string, updatedTask: Omit<Task, "id">) => void;
  deleteTask: (taskId: string) => void;
  addContributor: (contributor: Omit<Contributor, "id">) => void;
  addComment: (comment: Omit<Comment, "id" | "createdAt">) => void;
}

export default function KanbanCard({
  card,
  listId,
  updateCard,
  deleteCard,
  addTask,
  updateTask,
  deleteTask,
  addContributor,
  addComment,
}: KanbanCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isContributorsOpen, setIsContributorsOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

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

  // Calculate task completion percentage
  const getTaskCompletionPercentage = () => {
    if (!card.tasks || card.tasks.length === 0) return 0;
    const completedTasks = card.tasks.filter(
      (task) => task.status === "completed",
    );
    return Math.round((completedTasks.length / card.tasks.length) * 100);
  };

  // Render different card content based on card type
  const renderCardContent = () => {
    switch (card.type) {
      case "project":
        return (
          <>
            {card.labels && card.labels.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {card.labels.map((label, index) => {
                  const colorConfig =
                    labelColors.find((c) => c.name === label.color) ??
                    labelColors[7]; // Default to gray
                  return (
                    <span
                      key={index}
                      className={`${colorConfig?.bg} ${colorConfig?.text} rounded-full px-2 py-0.5 text-xs`}
                    >
                      {label.text}
                    </span>
                  );
                })}
              </div>
            )}
            <h4 className="text-sm font-medium">{card.title}</h4>
            {card.description && (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                {card.description}
              </p>
            )}

            <div className="mt-3 space-y-2">
              {/* Task progress */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="text-muted-foreground h-3.5 w-3.5" />
                  <span>Tasks</span>
                </div>
                <span className="text-muted-foreground">
                  {card.tasks
                    ? `${card.tasks.filter((t) => t.status === "completed").length}/${card.tasks.length}`
                    : "0/0"}
                </span>
              </div>
              <Progress
                value={getTaskCompletionPercentage()}
                className="h-1.5"
              />

              {/* Contributors */}
              {card.contributors && card.contributors.length > 0 && (
                <div className="mt-2 flex -space-x-2 overflow-hidden">
                  {card.contributors.slice(0, 3).map((contributor, index) => (
                    <Avatar
                      key={index}
                      className="border-background h-6 w-6 border-2"
                    >
                      <AvatarFallback className="bg-purple-100 text-[10px] text-purple-700">
                        {contributor.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {card.contributors.length > 3 && (
                    <div className="border-background bg-muted flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px]">
                      +{card.contributors.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Comments count */}
              {card.comments && card.comments.length > 0 && (
                <div className="text-muted-foreground mt-2 flex items-center text-xs">
                  <MessageSquare className="mr-1 h-3.5 w-3.5" />
                  {card.comments.length} comment
                  {card.comments.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </>
        );

      case "task":
        return (
          <>
            {card.labels && card.labels.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {card.labels.map((label, index) => {
                  const colorConfig =
                    labelColors.find((c) => c.name === label.color) ??
                    labelColors[7];
                  return (
                    <span
                      key={index}
                      className={`${colorConfig?.bg} ${colorConfig?.text} rounded-full px-2 py-0.5 text-xs`}
                    >
                      {label.text}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              {card.status === "completed" ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
              ) : card.status === "in-progress" ? (
                <Clock className="h-4 w-4 flex-shrink-0 text-blue-500" />
              ) : (
                <Circle className="text-muted-foreground h-4 w-4 flex-shrink-0" />
              )}
              <h4 className="text-sm font-medium">{card.title}</h4>
            </div>
            {card.description && (
              <p className="text-muted-foreground mt-1 ml-5.5 line-clamp-2 text-xs">
                {card.description}
              </p>
            )}

            {card.assignees && card.assignees.length > 0 && (
              <div className="mt-2 ml-5.5 flex -space-x-2 overflow-hidden">
                {card.assignees.map((assignee, index) => (
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
          </>
        );

      case "comment":
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
              <h4 className="text-sm font-medium">{card.author}</h4>
              {card.createdAt && (
                <span className="text-muted-foreground text-xs">
                  {new Date(card.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <p className="text-xs">{card.description}</p>
          </div>
        );

      default:
        return (
          <>
            <h4 className="text-sm font-medium">{card.title}</h4>
            <p className="text-muted-foreground mt-1 text-xs">
              {card.description}
            </p>
          </>
        );
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-all duration-200 hover:shadow ${
          isDragging ? "rotate-1 opacity-50" : ""
        }`}
        onClick={() => setIsDialogOpen(true)}
      >
        {renderCardContent()}
      </div>

      {card.type === "project" && (
        <ProjectCardDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          card={card}
          onUpdate={updateCard}
          onDelete={deleteCard}
          onAddTask={addTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onAddContributor={addContributor}
          onAddComment={addComment}
        />
      )}

      {card.type !== "project" && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{card.title}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <p className="text-sm">{card.description}</p>

              {card.type === "task" && (
                <>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        card.status === "completed" ? "default" : "outline"
                      }
                    >
                      {card.status === "completed"
                        ? "Completed"
                        : card.status === "in-progress"
                          ? "In Progress"
                          : "To Do"}
                    </Badge>

                    {card.dueDate && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        Due {new Date(card.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>

                  {card.assignees && card.assignees.length > 0 && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Assignees</h4>
                      <div className="flex flex-wrap gap-2">
                        {card.assignees.map((assignee, index) => (
                          <div
                            key={index}
                            className="bg-muted flex items-center gap-2 rounded-md p-1.5"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-purple-100 text-[10px] text-purple-700">
                                {assignee.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-medium">
                                {assignee.name}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {assignee.role}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  deleteCard();
                  setIsDialogOpen(false);
                }}
                className="mr-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
