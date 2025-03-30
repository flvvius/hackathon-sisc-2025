"use client"

import { useState } from "react"
import type { Card } from "./KanbanBoard"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import { CalendarIcon, MessageSquare, Briefcase } from "lucide-react"

interface AddCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCard: (card: Omit<Card, "id">) => void
}

export default function AddCardDialog({ open, onOpenChange, onAddCard }: AddCardDialogProps) {
  const [activeTab, setActiveTab] = useState<"project" | "task" | "comment">("project")

  // Project fields
  const [projectTitle, setProjectTitle] = useState("")
  const [projectDescription, setProjectDescription] = useState("")

  // Task fields
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskStatus, setTaskStatus] = useState<"todo" | "in-progress" | "completed">("todo")

  // Comment fields
  const [commentAuthor, setCommentAuthor] = useState("")
  const [commentText, setCommentText] = useState("")

  const resetForm = () => {
    // Reset all form fields
    setProjectTitle("")
    setProjectDescription("")
    setTaskTitle("")
    setTaskDescription("")
    setTaskStatus("todo")
    setCommentAuthor("")
    setCommentText("")
    setActiveTab("project")
  }

  const handleAddCard = () => {
    let newCard: Omit<Card, "id">

    switch (activeTab) {
      case "project":
        newCard = {
          title: projectTitle,
          description: projectDescription,
          type: "project",
          tasks: [],
          contributors: [],
          comments: [],
          labels: [],
        }
        break

      case "task":
        newCard = {
          title: taskTitle,
          description: taskDescription,
          type: "task",
          status: taskStatus,
          assignees: [],
          labels: [],
        }
        break

      case "comment":
        newCard = {
          title: `Comment from ${commentAuthor}`,
          description: commentText,
          type: "comment",
          author: commentAuthor,
          createdAt: new Date().toISOString().split("T")[0],
        }
        break

      default:
        return
    }

    onAddCard(newCard)
    resetForm()
  }

  const isFormValid = () => {
    switch (activeTab) {
      case "project":
        return projectTitle.trim() !== ""
      case "task":
        return taskTitle.trim() !== ""
      case "comment":
        return commentAuthor.trim() !== "" && commentText.trim() !== ""
      default:
        return false
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "project" | "task" | "comment")}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="project" className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Project</span>
            </TabsTrigger>
            <TabsTrigger value="task" className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Task</span>
            </TabsTrigger>
            <TabsTrigger value="comment" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comment</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="project" className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="project-title">Title</Label>
              <Input
                id="project-title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Enter project title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter project description"
              />
            </div>
          </TabsContent>

          <TabsContent value="task" className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter task description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-status">Status</Label>
              <select
                id="task-status"
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as "todo" | "in-progress" | "completed")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </TabsContent>

          <TabsContent value="comment" className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="comment-author">Author</Label>
              <Input
                id="comment-author"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Who is making this comment?"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment-text">Comment</Label>
              <Textarea
                id="comment-text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter comment text"
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleAddCard} disabled={!isFormValid()} className="bg-purple-600 hover:bg-purple-700">
            Add Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

