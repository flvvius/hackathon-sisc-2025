"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import NewBoardDialog from "./NewBoardDialog";

type Board = {
  id: string;
  title: string;
  description: string | null;
};

interface BoardSelectorProps {
  boards: Board[];
  selectedBoardId: string | null;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (title: string, description?: string) => Promise<unknown>;
  isCreating: boolean;
}

export default function BoardSelector({
  boards,
  selectedBoardId,
  onSelectBoard,
  onCreateBoard,
  isCreating,
}: BoardSelectorProps) {
  const [isNewBoardDialogOpen, setIsNewBoardDialogOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <div className="flex-grow">
        <Select
          value={selectedBoardId ?? undefined}
          onValueChange={onSelectBoard}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a board" />
          </SelectTrigger>
          <SelectContent>
            {boards.map((board) => (
              <SelectItem key={board.id} value={board.id}>
                {board.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsNewBoardDialogOpen(true)}
        title="Create new board"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <NewBoardDialog
        open={isNewBoardDialogOpen}
        onOpenChange={setIsNewBoardDialogOpen}
        onCreateBoard={onCreateBoard}
        isCreating={isCreating}
      />
    </div>
  );
}
