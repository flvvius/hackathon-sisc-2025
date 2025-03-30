"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { toast } from "sonner";
import type {
  BoardMember,
  BoardMemberRole,
} from "~/server/actions/boardMembers";
import {
  getBoardMembers,
  addBoardMember,
  updateBoardMemberRole,
  removeBoardMember,
} from "~/server/actions/boardMembers";

interface BoardMembersContextType {
  members: BoardMember[];
  isLoading: boolean;
  error: string | null;
  addMember: (
    email: string,
    role?: BoardMemberRole,
  ) => Promise<BoardMember | null>;
  updateMemberRole: (
    memberId: string,
    role: BoardMemberRole,
  ) => Promise<BoardMember | null>;
  removeMember: (memberId: string) => Promise<boolean>;
  refreshMembers: () => Promise<void>;
}

const BoardMembersContext = createContext<BoardMembersContextType | null>(null);

export const BoardMembersProvider = ({
  children,
  boardId,
}: {
  children: React.ReactNode;
  boardId: string;
}) => {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMembers = useCallback(async () => {
    if (!boardId) return;

    setIsLoading(true);
    setError(null);
    try {
      const boardMembers = await getBoardMembers(boardId);
      console.log("Board members data:", boardMembers);
      if (boardMembers.length > 0 && boardMembers[0].user) {
        console.log("First member user object:", boardMembers[0].user);
        console.log(
          "User object properties:",
          Object.keys(boardMembers[0].user ?? {}),
        );
      }
      setMembers(boardMembers);
    } catch (err) {
      console.error("Failed to fetch board members:", err);
      setError("Failed to load board members");
      toast.error("Failed to load board members");
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    void refreshMembers();
  }, [refreshMembers]);

  const addMember = useCallback(
    async (email: string, role?: BoardMemberRole) => {
      if (!boardId || !email) return null;

      try {
        const newMember = await addBoardMember(boardId, email, role);
        if (newMember) {
          console.log("New member added with data:", newMember);
          console.log("User object:", newMember.user);
          setMembers((prev) => [...prev, newMember]);
          toast.success(`${email} added to the board`);
        }
        return newMember;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add member";
        console.error("Failed to add member:", err);
        toast.error(errorMessage);
        return null;
      }
    },
    [boardId],
  );

  const updateMemberRole = useCallback(
    async (memberId: string, role: BoardMemberRole) => {
      if (!memberId) return null;

      try {
        const updatedMember = await updateBoardMemberRole(memberId, role);
        if (updatedMember) {
          setMembers((prev) =>
            prev.map((member) =>
              member.id === memberId ? updatedMember : member,
            ),
          );
          toast.success(`Member role updated to ${role}`);
        }
        return updatedMember;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update member role";
        console.error("Failed to update member role:", err);
        toast.error(errorMessage);
        return null;
      }
    },
    [],
  );

  const removeMember = useCallback(async (memberId: string) => {
    if (!memberId) return false;

    try {
      const success = await removeBoardMember(memberId);
      if (success) {
        setMembers((prev) => prev.filter((member) => member.id !== memberId));
        toast.success("Member removed from the board");
      }
      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove member";
      console.error("Failed to remove member:", err);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  return (
    <BoardMembersContext.Provider
      value={{
        members,
        isLoading,
        error,
        addMember,
        updateMemberRole,
        removeMember,
        refreshMembers,
      }}
    >
      {children}
    </BoardMembersContext.Provider>
  );
};

export function useBoardMembers() {
  const context = useContext(BoardMembersContext);
  if (!context) {
    throw new Error(
      "useBoardMembers must be used within a BoardMembersProvider",
    );
  }
  return context;
}
