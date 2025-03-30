"use client";

import { useState, useRef } from "react";
import { useDrop } from "react-dnd";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import KanbanCard from "~/components/layout/KanbanCard";
import { MoreHorizontal, Plus, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import TaskAssignees from "~/components/project/TaskAssignees";
import { BoardMembersProvider } from "~/hooks/useBoardMembers";
import type { CardItem, UserInfo } from "~/lib/types";

interface ListProps {
  id: string;
  title: string;
  cards: CardItem[];
  boardId: string;
  onCreateCard: (
    listId: string,
    title: string,
    description?: string,
    assignees?: UserInfo[],
  ) => Promise<CardItem | null>;
  onMoveCard: (
    cardId: string,
    sourceListId: string,
    targetListId: string,
  ) => Promise<void>;
  onUpdateCard: (
    cardId: string,
    data: {
      title?: string;
      description?: string | null;
      status?: string;
      assignees?: UserInfo[];
      labels?: Array<{ text: string; color: string }>;
    },
  ) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
}

export default function List({
  id,
  title,
  cards,
  boardId,
  onCreateCard,
  onMoveCard,
  onUpdateCard,
  onDeleteCard,
}: ListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardAssignees, setNewCardAssignees] = useState<UserInfo[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  // Set up drop target
  const [{ isOver }, drop] = useDrop({
    accept: "CARD",
    drop: (item: { id: string; listId: string }) => {
      if (item.listId !== id) {
        void onMoveCard(item.id, item.listId, id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Connect the drop ref to the DOM element
  drop(listRef);

  const handleCreateCard = async () => {
    if (newCardTitle.trim()) {
      const newCard = await onCreateCard(
        id,
        newCardTitle,
        newCardDescription || undefined,
        newCardAssignees.length > 0 ? newCardAssignees : undefined,
      );
      if (newCard) {
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setNewCardTitle("");
    setNewCardDescription("");
    setNewCardAssignees([]);
    setShowAddForm(false);
  };

  return (
    <div
      ref={listRef}
      className={`bg-muted/20 flex h-full w-72 shrink-0 flex-col rounded-md border ${
        isOver ? "border-blue-500" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b p-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => alert("Rename list not implemented")}
            >
              Rename List
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => alert("Delete list not implemented")}
            >
              Delete List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            listId={id}
            boardId={boardId}
            updateCard={(cardId, data) => {
              void onUpdateCard(cardId, data);
            }}
            deleteCard={() => void onDeleteCard(card.id)}
          />
        ))}

        {showAddForm ? (
          <div className="bg-background rounded-md border p-2 shadow-sm">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Task title"
              className="mb-2"
              autoFocus
            />
            <Textarea
              value={newCardDescription}
              onChange={(e) => setNewCardDescription(e.target.value)}
              placeholder="Description (optional)"
              className="mb-2 min-h-[60px] resize-none"
            />
            <BoardMembersProvider boardId={boardId}>
              <TaskAssignees
                boardId={boardId}
                assignees={newCardAssignees}
                onChange={setNewCardAssignees}
              />
            </BoardMembersProvider>
            <div className="mt-3 flex space-x-2">
              <Button
                size="sm"
                onClick={handleCreateCard}
                disabled={!newCardTitle.trim()}
              >
                Add Task
              </Button>
              <Button size="sm" variant="ghost" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground justify-start"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add a task
          </Button>
        )}
      </div>
    </div>
  );
}
