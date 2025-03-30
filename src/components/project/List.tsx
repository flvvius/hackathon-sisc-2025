"use client";

import { useState, useRef } from "react";
import { useDrop } from "react-dnd";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { CardItem } from "~/lib/types";
import { CardComponent } from "./CardComponent";

interface ListProps {
  id: string;
  title: string;
  cards: CardItem[];
  onCreateCard: (
    listId: string,
    title: string,
    description?: string,
  ) => Promise<CardItem | null>;
  onMoveCard: (
    cardId: string,
    sourceListId: string,
    targetListId: string,
  ) => Promise<void>;
  onUpdateCard: (
    cardId: string,
    data: { title?: string; description?: string | null },
  ) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
}

export default function List({
  id,
  title,
  cards,
  onCreateCard,
  onMoveCard,
  onUpdateCard,
  onDeleteCard,
}: ListProps) {
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  // Create a ref for the drop target
  const listRef = useRef<HTMLDivElement>(null);

  // Set up drop target for cards
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

  // Connect the drop ref
  drop(listRef);

  const handleCreateCard = async () => {
    if (!newCardTitle.trim()) return;

    setIsCreatingCard(true);
    try {
      await onCreateCard(id, newCardTitle, newCardDescription || undefined);
      setNewCardTitle("");
      setNewCardDescription("");
      setShowNewCardForm(false);
    } catch (error) {
      console.error("Failed to create card:", error);
    } finally {
      setIsCreatingCard(false);
    }
  };

  return (
    <div
      ref={listRef}
      className={`bg-muted/20 flex h-full w-72 shrink-0 flex-col rounded-md border p-2 ${
        isOver ? "border-blue-500 bg-blue-50/50" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {cards.map((card) => (
          <CardComponent
            key={card.id}
            card={card}
            listId={id}
            onDeleteCard={onDeleteCard}
          />
        ))}
      </div>

      {showNewCardForm ? (
        <div className="mt-2 space-y-2">
          <Input
            placeholder="Card title"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            className="text-sm"
            autoFocus
          />
          <Textarea
            placeholder="Description (optional)"
            value={newCardDescription}
            onChange={(e) => setNewCardDescription(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleCreateCard}
              disabled={!newCardTitle.trim() || isCreatingCard}
            >
              {isCreatingCard ? "Adding..." : "Add"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowNewCardForm(false);
                setNewCardTitle("");
                setNewCardDescription("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          className="text-muted-foreground mt-2 justify-start"
          onClick={() => setShowNewCardForm(true)}
        >
          <Plus className="mr-1 h-4 w-4" />
          <span className="text-sm">Add a card</span>
        </Button>
      )}
    </div>
  );
}
