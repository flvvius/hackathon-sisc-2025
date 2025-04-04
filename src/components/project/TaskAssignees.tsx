"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { UserPlus, X, Github, GitBranch } from "lucide-react";
import { useBoardMembers } from "~/hooks/useBoardMembers";
import { type UserInfo } from "~/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface TaskAssigneesProps {
  boardId: string;
  assignees: UserInfo[];
  onChange: (assignees: UserInfo[]) => void;
}

export default function TaskAssignees({
  boardId,
  assignees,
  onChange,
}: TaskAssigneesProps) {
  const [open, setOpen] = useState(false);
  const { members, isLoading, error } = useBoardMembers();

  // Helper to get initials from name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Toggle a user as assignee
  const toggleAssignee = (user: UserInfo) => {
    const isAssigned = assignees.some((a) => a.id === user.id);

    if (isAssigned) {
      // Remove user from assignees
      onChange(assignees.filter((a) => a.id !== user.id));
    } else {
      // Add user to assignees
      onChange([...assignees, user]);
    }
  };

  // Remove assignee
  const removeAssignee = (userId: string) => {
    onChange(assignees.filter((a) => a.id !== userId));
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Assignees</div>
      <div className="flex flex-wrap gap-2">
        {assignees.length > 0 ? (
          assignees.map((assignee) => (
            <Badge
              key={assignee.id}
              variant="outline"
              className="flex items-center gap-1 pl-1"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={assignee.imageUrl ?? undefined}
                  alt={assignee.name ?? "User"}
                />
                <AvatarFallback className="text-[10px]">
                  {getInitials(assignee.name)}
                </AvatarFallback>
              </Avatar>
              <span className="flex items-center gap-1 text-xs">
                {assignee.name ?? "User"}

                {/* Show GitHub username if available */}
                {assignee.githubUsername && (
                  <Badge
                    variant="secondary"
                    className="h-4 bg-slate-100 px-1 py-0 font-mono text-[8px]"
                  >
                    <Github className="mr-0.5 h-2.5 w-2.5" />@
                    {assignee.githubUsername}
                  </Badge>
                )}

                {/* Show GitLab username if available */}
                {assignee.gitlabUsername && (
                  <Badge
                    variant="secondary"
                    className="h-4 bg-orange-50 px-1 py-0 font-mono text-[8px] text-orange-700"
                  >
                    <GitBranch className="mr-0.5 h-2.5 w-2.5" />@
                    {assignee.gitlabUsername}
                  </Badge>
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-5 w-5 p-0"
                onClick={() => removeAssignee(assignee.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        ) : (
          <div className="text-muted-foreground text-xs">No assignees</div>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 rounded-full">
              <UserPlus className="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                <div className="p-2 text-sm font-medium">Assign Users</div>
                {isLoading ? (
                  <div className="text-muted-foreground py-4 text-center text-sm">
                    Loading team members...
                  </div>
                ) : error ? (
                  <div className="py-4 text-center text-sm text-red-500">
                    {error}
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-muted-foreground py-4 text-center text-sm">
                    No team members available
                  </div>
                ) : (
                  <div className="space-y-1">
                    {members.map((member) => {
                      const user = member.user;
                      if (!user) return null;

                      const isAssigned = assignees.some(
                        (a) => a.id === user.id,
                      );

                      return (
                        <button
                          key={member.id}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                            isAssigned ? "bg-muted/60" : "hover:bg-muted/40"
                          }`}
                          onClick={() =>
                            toggleAssignee({
                              id: user.id,
                              name: user.name,
                              email: user.email,
                              imageUrl: user.imageUrl,
                              githubUsername: user.githubUsername,
                              gitlabUsername: user.gitlabUsername,
                            })
                          }
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={user.imageUrl ?? undefined}
                              alt={user.name ?? "User"}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{user.name ?? user.email}</span>
                            <div className="flex items-center gap-1">
                              {user.githubUsername && (
                                <span className="text-muted-foreground flex items-center text-[10px]">
                                  <Github className="mr-0.5 h-3 w-3" />@
                                  {user.githubUsername}
                                </span>
                              )}
                              {user.gitlabUsername && (
                                <span className="text-muted-foreground ml-1 flex items-center text-[10px]">
                                  <GitBranch className="mr-0.5 h-3 w-3" />@
                                  {user.gitlabUsername}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
