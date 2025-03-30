"use client";

import { useCallback, useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import List from "~/components/project/List";
import BoardSelector from "~/components/project/BoardSelector";
import BoardSettings from "~/components/project/BoardSettings";
import { useBoards } from "~/hooks/useBoards";
import {
  getBoardLists,
  createCard,
  moveCardToList,
  updateCard,
  deleteCard,
  updateBoard,
} from "~/server/actions/boards";
import { toast } from "sonner";
import type { CardItem, ListItem, DbList, DbCard } from "~/lib/types";

export default function KanbanBoard() {
  const {
    boards,
    isLoading: boardsLoading,
    error: boardsError,
    createBoard,
    isCreating,
  } = useBoards();
  const [activeBoard, setActiveBoard] = useState<string | undefined>(undefined);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [showNewListInput, setShowNewListInput] = useState(false);

  // Find the active board object
  const currentBoard = boards?.find((board) => board.id === activeBoard);

  // Set first board as active if available
  useEffect(() => {
    if (boards && boards.length > 0 && !activeBoard) {
      setActiveBoard(boards[0].id);
    }
  }, [boards, activeBoard]);

  // Convert a database card to a frontend CardItem
  const convertToCardItem = (dbCard: DbCard): CardItem | null => {
    if (!dbCard?.id || !dbCard?.title || !dbCard?.listId) {
      return null;
    }

    return {
      id: dbCard.id,
      title: dbCard.title,
      description: dbCard.description,
      position: dbCard.position ?? 0,
      listId: dbCard.listId,
      type: (dbCard.type === "comment" ? "comment" : "project") as
        | "project"
        | "comment",
    };
  };

  // Convert a database list to a frontend ListItem
  const convertToListItem = (dbList: DbList): ListItem | null => {
    if (
      !dbList?.id ||
      !dbList?.title ||
      !dbList?.boardId ||
      dbList?.position === undefined
    ) {
      return null;
    }

    const cards: CardItem[] = (dbList.cards ?? [])
      .map(convertToCardItem)
      .filter((card): card is CardItem => card !== null);

    return {
      id: dbList.id,
      title: dbList.title,
      boardId: dbList.boardId,
      position: dbList.position,
      cards,
    };
  };

  // Fetch lists when activeBoard changes
  useEffect(() => {
    if (!activeBoard) return;

    const fetchLists = async () => {
      setIsLoadingLists(true);
      try {
        const boardLists = await getBoardLists(activeBoard);
        // Transform database board lists to our List type
        const transformedLists: ListItem[] = boardLists
          .map(convertToListItem)
          .filter((list): list is ListItem => list !== null);

        setLists(transformedLists);
      } catch (err) {
        console.error("Failed to fetch lists:", err);
        toast.error("Failed to load board lists");
      } finally {
        setIsLoadingLists(false);
      }
    };

    fetchLists();
  }, [activeBoard]);

  const handleSelectBoard = useCallback((boardId: string) => {
    setActiveBoard(boardId);
  }, []);

  const handleCreateCard = async (
    listId: string,
    title: string,
    description?: string,
  ) => {
    try {
      const newCard = await createCard(listId, title, description);
      if (!newCard) {
        toast.error("Failed to create card: Invalid response");
        return null;
      }

      const typedCard = convertToCardItem(newCard as DbCard);
      if (!typedCard) {
        toast.error("Failed to create card: Invalid data");
        return null;
      }

      // Update lists with the new card
      setLists((prevLists) =>
        prevLists.map((list) => {
          if (list.id === listId) {
            return {
              ...list,
              cards: [...list.cards, typedCard],
            };
          }
          return list;
        }),
      );

      return typedCard;
    } catch (err) {
      console.error("Failed to create card:", err);
      toast.error("Failed to create card");
      return null;
    }
  };

  const handleMoveCard = async (
    cardId: string,
    sourceListId: string,
    targetListId: string,
  ) => {
    try {
      // First update the UI optimistically
      setLists((prevLists) => {
        const newLists = [...prevLists];
        const sourceListIndex = newLists.findIndex(
          (list) => list.id === sourceListId,
        );
        const targetListIndex = newLists.findIndex(
          (list) => list.id === targetListId,
        );

        if (sourceListIndex === -1 || targetListIndex === -1) return prevLists;

        const cardIndex = newLists[sourceListIndex].cards.findIndex(
          (card) => card.id === cardId,
        );
        if (cardIndex === -1) return prevLists;

        const movedCard = newLists[sourceListIndex].cards[cardIndex];
        // Remove the card from source list
        newLists[sourceListIndex].cards.splice(cardIndex, 1);

        // Add to target list with updated properties
        newLists[targetListIndex].cards.push({
          ...movedCard,
          listId: targetListId,
          position: newLists[targetListIndex].cards.length,
        });

        return newLists;
      });

      // Then perform the actual update in the database
      await moveCardToList(cardId, sourceListId, targetListId);
    } catch (err) {
      console.error("Failed to move card:", err);
      toast.error("Failed to move card");
      // Revert the optimistic update by refetching the lists
      if (activeBoard) {
        await refreshLists(activeBoard);
      }
    }
  };

  const handleUpdateCard = async (
    cardId: string,
    data: { title?: string; description?: string | null },
  ) => {
    try {
      // Update UI optimistically
      setLists((prevLists) => {
        return prevLists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === cardId ? { ...card, ...data } : card,
          ),
        }));
      });

      // Then update in the database
      await updateCard(cardId, data);
    } catch (err) {
      console.error("Failed to update card:", err);
      toast.error("Failed to update card");
      // Revert the optimistic update by refetching the lists
      if (activeBoard) {
        await refreshLists(activeBoard);
      }
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      // Update UI optimistically
      setLists((prevLists) => {
        return prevLists.map((list) => ({
          ...list,
          cards: list.cards.filter((card) => card.id !== cardId),
        }));
      });

      // Then delete from the database
      await deleteCard(cardId);
    } catch (err) {
      console.error("Failed to delete card:", err);
      toast.error("Failed to delete card");
      // Revert the optimistic update by refetching the lists
      if (activeBoard) {
        await refreshLists(activeBoard);
      }
    }
  };

  // Helper function to refresh lists for a board
  const refreshLists = async (boardId: string) => {
    try {
      const boardLists = await getBoardLists(boardId);
      // Transform database board lists to our List type with validation
      const transformedLists: ListItem[] = boardLists
        .map(convertToListItem)
        .filter((list): list is ListItem => list !== null);

      setLists(transformedLists);
    } catch (err) {
      console.error("Failed to refresh lists:", err);
    }
  };

  const handleUpdateBoard = async (
    boardId: string,
    data: { title?: string; description?: string | null },
  ) => {
    try {
      const updatedBoard = await updateBoard(boardId, data);
      return updatedBoard;
    } catch (error) {
      console.error("Failed to update board:", error);
      toast.error("Failed to update board");
      return null;
    }
  };

  if (boardsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading boards...</p>
      </div>
    );
  }

  if (boardsError) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Error loading boards: {boardsError}</p>
      </div>
    );
  }

  if (!boards || boards.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          No boards found. Create your first board!
        </p>
        <Button onClick={() => createBoard("New Board")} disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Board"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <BoardSelector
          boards={boards}
          selectedBoardId={activeBoard ?? undefined}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={createBoard}
          isCreating={isCreating}
        />
        {currentBoard && (
          <BoardSettings
            board={currentBoard}
            onUpdateBoard={handleUpdateBoard}
          />
        )}
      </div>

      {isLoadingLists ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      ) : (
        <div className="flex h-full flex-1 space-x-4 overflow-x-auto p-4">
          {lists.map((list) => (
            <List
              key={list.id}
              id={list.id}
              title={list.title}
              cards={list.cards}
              onCreateCard={handleCreateCard}
              onMoveCard={handleMoveCard}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
            />
          ))}

          {showNewListInput ? (
            <div className="bg-muted/20 flex h-fit w-72 shrink-0 flex-col rounded-md border p-2">
              <Input
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title..."
                className="mb-2"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => {
                    // TODO: Implement adding new list
                    setShowNewListInput(false);
                    setNewListTitle("");
                  }}
                  disabled={!newListTitle.trim()}
                >
                  Add List
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowNewListInput(false);
                    setNewListTitle("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="text-muted-foreground h-fit w-72 justify-start border-dashed px-3 py-2"
              onClick={() => setShowNewListInput(true)}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add List
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
