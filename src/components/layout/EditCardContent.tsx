"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { CalendarIcon, Pencil, Tag } from "lucide-react";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// Define a more comprehensive Card type that covers all use cases
type CardType = "task" | "contributor" | "comment" | "attachment" | "project";

type Label = {
  text: string;
  color: string;
};

// Complete Card type with all possible fields
type Card = {
  id: string;
  title: string;
  description: string;
  type: CardType;
  // Optional fields for all card types
  labels?: Label[];
  // Task specific
  assignee?: string;
  dueDate?: string;
  // Contributor specific
  contributorName?: string;
  contributorRole?: string;
  contributorAvatar?: string;
  // Comment specific
  commentAuthor?: string;
  commentDate?: string;
  // Attachment specific
  attachmentType?: string;
  attachmentUrl?: string;
};

// Label colors
const labelColors = [
  { name: "purple", bg: "bg-purple-100", text: "text-purple-700" },
  { name: "blue", bg: "bg-blue-100", text: "text-blue-700" },
  { name: "green", bg: "bg-green-100", text: "text-green-700" },
  { name: "yellow", bg: "bg-amber-100", text: "text-amber-700" },
  { name: "red", bg: "bg-red-100", text: "text-red-700" },
  { name: "pink", bg: "bg-pink-100", text: "text-pink-700" },
  { name: "indigo", bg: "bg-indigo-100", text: "text-indigo-700" },
  { name: "gray", bg: "bg-gray-100", text: "text-gray-700" },
];

interface EditCardContentProps {
  card: Card;
  onUpdate: (updatedCard: Omit<Card, "id">) => void;
}

export default function EditCardContent({
  card,
  onUpdate,
}: EditCardContentProps) {
  // Common fields
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);

  // Task specific fields
  const [assignee, setAssignee] = useState(card.assignee ?? "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    card.dueDate ? new Date(card.dueDate) : undefined,
  );
  const [labels, setLabels] = useState<Label[]>(card.labels ?? []);
  const [newLabelText, setNewLabelText] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("purple");
  const [showLabelInput, setShowLabelInput] = useState(false);

  // Contributor specific fields
  const [contributorName, setContributorName] = useState(
    card.contributorName ?? "",
  );
  const [contributorRole, setContributorRole] = useState(
    card.contributorRole ?? "",
  );

  // Comment specific fields
  const [commentAuthor, setCommentAuthor] = useState(card.commentAuthor ?? "");

  // Attachment specific fields
  const [attachmentType, setAttachmentType] = useState(
    card.attachmentType ?? "document",
  );
  const [attachmentUrl, setAttachmentUrl] = useState(card.attachmentUrl ?? "");

  const handleSave = () => {
    let updatedCard: Omit<Card, "id">;

    switch (card.type) {
      case "task":
        updatedCard = {
          title,
          description,
          type: "task",
          assignee: assignee === "" ? undefined : assignee,
          dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : undefined,
          labels: labels.length > 0 ? labels : undefined,
        };
        break;

      case "contributor":
        updatedCard = {
          title: contributorName, // Use name as title for contributor cards
          description: contributorRole, // Use role as description for contributor cards
          type: "contributor",
          contributorName,
          contributorRole,
          contributorAvatar:
            card.contributorAvatar ?? "/placeholder.svg?height=40&width=40",
        };
        break;

      case "comment":
        updatedCard = {
          title: `Comment from ${commentAuthor}`,
          description,
          type: "comment",
          commentAuthor,
          commentDate:
            card.commentDate ?? new Date().toISOString().split("T")[0],
        };
        break;

      case "attachment":
        updatedCard = {
          title,
          description,
          type: "attachment",
          attachmentUrl: attachmentUrl === "" ? "#" : attachmentUrl,
          attachmentType,
        };
        break;

      default:
        updatedCard = {
          title,
          description,
          type: card.type,
        };
    }

    onUpdate(updatedCard);
  };

  const addLabel = () => {
    if (
      newLabelText.trim() &&
      !labels.some((label) => label.text === newLabelText.trim().toLowerCase())
    ) {
      setLabels([
        ...labels,
        {
          text: newLabelText.trim().toLowerCase(),
          color: newLabelColor,
        },
      ]);
      setNewLabelText("");
      setShowLabelInput(false);
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter((label) => label.text !== labelToRemove));
  };

  // Render different edit forms based on card type
  const renderEditForm = () => {
    switch (card.type) {
      case "task":
        return (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Add a more detailed description..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Who is responsible for this task?"
              />
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Labels</Label>
                {!showLabelInput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLabelInput(true);
                    }}
                    className="h-7 px-2"
                  >
                    <Tag className="mr-1 h-3.5 w-3.5" />
                    Add
                  </Button>
                )}
              </div>
              {showLabelInput && (
                <div className="grid gap-2">
                  <div className="flex gap-2">
                    <Input
                      value={newLabelText}
                      onChange={(e) => setNewLabelText(e.target.value)}
                      placeholder="Enter label name"
                      className="h-8"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addLabel();
                        if (e.key === "Escape") {
                          setShowLabelInput(false);
                          setNewLabelText("");
                        }
                      }}
                      autoFocus
                    />
                    <Select
                      value={newLabelColor}
                      onValueChange={setNewLabelColor}
                    >
                      <SelectTrigger className="h-8 w-[100px]">
                        <SelectValue placeholder="Color" />
                      </SelectTrigger>
                      <SelectContent>
                        {labelColors.map((color) => (
                          <SelectItem key={color.name} value={color.name}>
                            <div className="flex items-center">
                              <div
                                className={`h-3 w-3 rounded-full ${color.bg} mr-2`}
                              ></div>
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8" onClick={addLabel}>
                      Add
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setShowLabelInput(false);
                        setNewLabelText("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              <div className="mt-1 flex flex-wrap gap-1">
                {labels.map((label, index) => {
                  // Get default values in case color is not found
                  const defaultBg = "bg-gray-100";
                  const defaultText = "text-gray-700";

                  // Find color or use defaults
                  const color = labelColors.find((c) => c.name === label.color);
                  const bgClass = color?.bg ?? defaultBg;
                  const textClass = color?.text ?? defaultText;

                  return (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`${bgClass} ${textClass} border-0`}
                    >
                      {label.text}
                      <button
                        className="ml-1 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLabel(label.text);
                        }}
                      >
                        ×
                      </button>
                    </Badge>
                  );
                })}
                {labels.length === 0 && (
                  <span className="text-muted-foreground text-xs">
                    No labels added yet
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={handleSave}
              className="mt-2 bg-purple-600 hover:bg-purple-700"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        );

      case "contributor":
        return (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="contributor-name">Name</Label>
              <Input
                id="contributor-name"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contributor-role">Role</Label>
              <Input
                id="contributor-role"
                value={contributorRole}
                onChange={(e) => setContributorRole(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSave}
              className="mt-2 bg-purple-600 hover:bg-purple-700"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        );

      case "comment":
        return (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="comment-author">Author</Label>
              <Input
                id="comment-author"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comment-text">Comment</Label>
              <Textarea
                id="comment-text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              onClick={handleSave}
              className="mt-2 bg-purple-600 hover:bg-purple-700"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        );

      case "attachment":
        return (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="attachment-title">Title</Label>
              <Input
                id="attachment-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attachment-description">Description</Label>
              <Textarea
                id="attachment-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attachment-type">Type</Label>
              <select
                id="attachment-type"
                value={attachmentType}
                onChange={(e) => setAttachmentType(e.target.value)}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="document">Document</option>
                <option value="image">Image</option>
                <option value="spreadsheet">Spreadsheet</option>
                <option value="presentation">Presentation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attachment-url">URL</Label>
              <Input
                id="attachment-url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="Enter attachment URL"
              />
            </div>
            <Button
              onClick={handleSave}
              className="mt-2 bg-purple-600 hover:bg-purple-700"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        );

      default:
        return (
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              onClick={handleSave}
              className="mt-2 bg-purple-600 hover:bg-purple-700"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        );
    }
  };

  return renderEditForm();
}
