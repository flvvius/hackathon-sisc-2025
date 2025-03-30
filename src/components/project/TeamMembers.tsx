"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ChevronDown, UserPlus, Users, X } from "lucide-react";
import { useBoardMembers } from "~/hooks/useBoardMembers";
import type { BoardMemberRole } from "~/server/actions/boardMembers";

export default function TeamMembers({ boardId }: { boardId: string }) {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<BoardMemberRole>("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    members,
    isLoading,
    error,
    addMember,
    updateMemberRole,
    removeMember,
  } = useBoardMembers();

  const handleAddMember = async () => {
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await addMember(email, role);
      if (success) {
        setEmail("");
        setRole("member");
        setIsAddMemberOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get initials for avatar fallback
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper to get color based on role
  const getRoleColor = (role: BoardMemberRole) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "member":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" /> Team Members
        </CardTitle>
        <CardDescription>
          Manage who has access to this board and their permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-pulse">Loading members...</div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="space-y-4">
            {members.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center">
                No members yet. Add team members to collaborate.
              </div>
            ) : (
              <div className="divide-y">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={member.user?.imageUrl ?? undefined}
                          alt={member.user?.name ?? "User"}
                        />
                        <AvatarFallback>
                          {getInitials(member.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.user?.name || "Unknown User"}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {member.user?.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${getRoleColor(
                          member.role,
                        )}`}
                      >
                        {member.role}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() =>
                              updateMemberRole(member.id, "owner")
                            }
                            disabled={member.role === "owner"}
                          >
                            Make Owner
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              updateMemberRole(member.id, "admin")
                            }
                            disabled={member.role === "admin"}
                          >
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              updateMemberRole(member.id, "member")
                            }
                            disabled={member.role === "member"}
                          >
                            Make Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              updateMemberRole(member.id, "viewer")
                            }
                            disabled={member.role === "viewer"}
                          >
                            Make Viewer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={() => removeMember(member.id)}
                          >
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Invite someone to collaborate on this board
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as BoardMemberRole)}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddMemberOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!email.trim() || isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
