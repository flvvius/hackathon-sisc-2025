"use client";

import { useState, useRef } from "react";
import { useDrop } from "react-dnd";
import type { Card, List } from "./KanbanBoard";
import KanbanCard from "./KanbanCard";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import AddCardDialog from "./AddCardDialog";
import type { Task, Contributor, Comment } from "./KanbanBoard";

interface KanbanListProps {
  list: List;
  moveCard: (
    cardId: string,
    sourceListId: string,
    targetListId: string,
  ) => void;
  addCard: (listId: string, card: Omit<Card, "id">) => void;
  updateCard: (
    listId: string,
    cardId: string,
    updatedCard: Omit<Card, "id">,
  ) => void;
  deleteCard: (listId: string, cardId: string) => void;
  deleteList: (listId: string) => void;
  updateListTitle: (listId: string, newTitle: string) => void;
  addTask: (listId: string, cardId: string, task: Omit<Task, "id">) => void;
  updateTask: (
    listId: string,
    cardId: string,
    taskId: string,
    updatedTask: Omit<Task, "id">,
  ) => void;
  deleteTask: (listId: string, cardId: string, taskId: string) => void;
  addContributor: (
    listId: string,
    cardId: string,
    contributor: Omit<Contributor, "id">,
  ) => void;
  addComment: (
    listId: string,
    cardId: string,
    comment: Omit<Comment, "id" | "createdAt">,
  ) => void;
}

export default function KanbanList({
  list,
  moveCard,
  addCard,
  updateCard,
  deleteCard,
  deleteList,
  updateListTitle,
  addTask,
  updateTask,
  deleteTask,
  addContributor,
  addComment,
}: KanbanListProps) {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);

  // Create a ref for the drop target
  const listRef = useRef<HTMLDivElement>(null);

  // Set up drop target for cards
  const [{ isOver }, connectDrop] = useDrop({
    accept: "CARD",
    drop: (item: { id: string; listId: string }) => {
      if (item.listId !== list.id) {
        moveCard(item.id, item.listId, list.id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  // Connect the drop ref
  connectDrop(listRef);

  const handleAddCard = (card: Omit<Card, "id">) => {
    addCard(list.id, card);
    setIsAddCardOpen(false);
  };

  const handleTitleSave = () => {
    updateListTitle(list.id, listTitle);
    setIsEditingTitle(false);
  };

  return (
    <div
      ref={listRef}
      className={`h-fit min-w-[280px] rounded-xl border bg-white/80 p-3 shadow-sm backdrop-blur-sm transition-all duration-200 ${
        isOver ? "border-purple-200 bg-purple-50/80 shadow-md" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        {isEditingTitle ? (
          <div className="flex w-full gap-1">
            <Input
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") {
                  setListTitle(list.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="h-7 py-1"
            />
            <Button
              size="sm"
              className="h-7 bg-purple-600 px-2 hover:bg-purple-700"
              onClick={handleTitleSave}
            >
              Save
            </Button>
          </div>
        ) : (
          <h3
            className="cursor-pointer rounded px-2 py-1 text-sm font-medium transition-colors hover:bg-purple-50"
            onClick={() => setIsEditingTitle(true)}
          >
            {list.title}{" "}
            <span className="text-muted-foreground ml-1">
              ({list.cards.length})
            </span>
          </h3>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => deleteList(list.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-2 max-h-[calc(100vh-16rem)] space-y-2 overflow-y-auto pr-1">
        {list.cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            listId={list.id}
            updateCard={(updatedCard) =>
              updateCard(list.id, card.id, updatedCard)
            }
            deleteCard={() => deleteCard(list.id, card.id)}
            addTask={(task) => addTask(list.id, card.id, task)}
            updateTask={(taskId, updatedTask) =>
              updateTask(list.id, card.id, taskId, updatedTask)
            }
            deleteTask={(taskId) => deleteTask(list.id, card.id, taskId)}
            addContributor={(contributor) =>
              addContributor(list.id, card.id, contributor)
            }
            addComment={(comment) => addComment(list.id, card.id, comment)}
          />
        ))}
      </div>

      <Button
        onClick={() => setIsAddCardOpen(true)}
        variant="ghost"
        className="text-muted-foreground hover:text-foreground group mt-1 w-full justify-start hover:bg-purple-50"
        size="sm"
      >
        <Plus className="mr-2 h-4 w-4 text-purple-500 group-hover:text-purple-600" />
        Add a card
      </Button>

      <AddCardDialog
        open={isAddCardOpen}
        onOpenChange={setIsAddCardOpen}
        onAddCard={handleAddCard}
      />
    </div>
  );
}
