"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Settings, UserPlus, Users } from "lucide-react";
import TeamMembers from "./TeamMembers";
import { BoardMembersProvider } from "~/hooks/useBoardMembers";
import { toast } from "sonner";

interface BoardData {
  id: string;
  title: string;
  description: string | null;
}

interface BoardSettingsProps {
  board: BoardData;
  onUpdateBoard: (
    boardId: string,
    data: { title?: string; description?: string | null },
  ) => Promise<BoardData | null>;
}

export default function BoardSettings({
  board,
  onUpdateBoard,
}: BoardSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveSettings = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const updated = await onUpdateBoard(board.id, {
        title,
        description: description || null,
      });
      if (updated) {
        toast.success("Board settings updated");
        setIsOpen(false);
      }
    } catch (error) {
      toast.error("Failed to update board settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" /> Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Board Settings</DialogTitle>
          <DialogDescription>
            Manage board settings and team members
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Board Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter board title"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter board description"
                  rows={4}
                />
              </div>
              <Button
                onClick={handleSaveSettings}
                disabled={!title.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="members" className="pt-4">
            <BoardMembersProvider boardId={board.id}>
              <TeamMembers boardId={board.id} />
            </BoardMembersProvider>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
