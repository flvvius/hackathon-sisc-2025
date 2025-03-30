"use client";

import { useState, useEffect } from "react";
import { getUserBoards, createBoard } from "~/server/actions/boards";
import { useUser } from "@clerk/nextjs";

// Define board types
type DbCard = {
  id: string;
  title: string;
  description: string | null;
  type: "project" | "comment";
};

type DbList = {
  id: string;
  title: string;
  position: number;
  cards?: DbCard[];
};

type DbBoard = {
  id: string;
  title: string;
  description: string | null;
  lists?: DbList[];
};

export type DbBoard = Awaited<ReturnType<typeof getUserBoards>>[0];

export function useBoards() {
  const { user, isLoaded } = useUser();
  const [boards, setBoards] = useState<DbBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchBoards = async () => {
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      setError(null);
      const userId = user?.id;

      if (!userId) {
        setBoards([]);
        return;
      }

      const userBoards = await getUserBoards(userId);
      setBoards(userBoards);
    } catch (error) {
      console.error("Failed to fetch boards:", error);
      setError("Failed to load boards");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [isLoaded, user?.id]);

  const handleCreateBoard = async (title: string, description?: string) => {
    if (!user?.id) {
      setError("You must be logged in to create a board");
      return null;
    }

    if (!title.trim()) {
      setError("Board title is required");
      return null;
    }

    try {
      setIsCreating(true);
      const newBoard = await createBoard(user.id, title, description);
      await fetchBoards();
      return newBoard;
    } catch (error) {
      console.error("Failed to create board:", error);
      setError("Failed to create board");
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const refreshBoards = async () => {
    return fetchBoards();
  };

  return {
    boards,
    isLoading,
    error,
    isCreating,
    createBoard: handleCreateBoard,
    refreshBoards,
  };
}
