"use client";

import { useRef } from "react";
import { useDrag } from "react-dnd";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import type { CardItem } from "~/lib/types";

interface CardComponentProps {
  card: CardItem;
  listId: string;
  onDeleteCard: (cardId: string) => Promise<void>;
}

export function CardComponent({
  card,
  listId,
  onDeleteCard,
}: CardComponentProps) {
  // Create a ref for the drag source
  const cardRef = useRef<HTMLDivElement>(null);

  // Set up drag source
  const [{ isDragging }, drag] = useDrag({
    type: "CARD",
    item: { id: card.id, listId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  // Connect the drag ref
  drag(cardRef);

  return (
    <div ref={cardRef} className={`${isDragging ? "opacity-50" : ""}`}>
      <Card className="cursor-pointer shadow-sm hover:shadow-md">
        <CardHeader className="p-3 pb-0">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium">{card.title}</h4>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                void onDeleteCard(card.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        {card.description && (
          <CardContent className="p-3 pt-1">
            <p className="text-muted-foreground text-xs">{card.description}</p>
          </CardContent>
        )}
        <CardFooter className="p-2">
          <div className="flex w-full items-center justify-end">
            <span className="text-muted-foreground text-xs">
              {card.type === "project" ? "Project" : "Comment"}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
