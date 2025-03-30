"use client";

import { useState } from "react";
import { Plus, X, Tag } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";

// Shared label colors array from KanbanCard
const labelColors = [
  {
    name: "green",
    bg: "bg-green-100 dark:bg-green-950/50",
    text: "text-green-700 dark:text-green-300",
  },
  {
    name: "red",
    bg: "bg-red-100 dark:bg-red-950/50",
    text: "text-red-700 dark:text-red-300",
  },
  {
    name: "blue",
    bg: "bg-blue-100 dark:bg-blue-950/50",
    text: "text-blue-700 dark:text-blue-300",
  },
  {
    name: "yellow",
    bg: "bg-yellow-100 dark:bg-yellow-900/40",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  {
    name: "purple",
    bg: "bg-purple-100 dark:bg-purple-950/50",
    text: "text-purple-700 dark:text-purple-300",
  },
  {
    name: "pink",
    bg: "bg-pink-100 dark:bg-pink-950/50",
    text: "text-pink-700 dark:text-pink-300",
  },
  {
    name: "indigo",
    bg: "bg-indigo-100 dark:bg-indigo-950/50",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  {
    name: "gray",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-700 dark:text-gray-300",
  },
] as const;

type CardLabel = {
  text: string;
  color: string;
};

interface TaskLabelPickerProps {
  labels: CardLabel[];
  onLabelsChange: (labels: CardLabel[]) => void;
}

export default function TaskLabelPicker({
  labels,
  onLabelsChange,
}: TaskLabelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newLabelText, setNewLabelText] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("green");

  const handleAddLabel = () => {
    if (!newLabelText.trim()) return;

    const newLabel: CardLabel = {
      text: newLabelText.trim(),
      color: selectedColor,
    };

    onLabelsChange([...labels, newLabel]);
    setNewLabelText("");
  };

  const handleRemoveLabel = (index: number) => {
    const updatedLabels = [...labels];
    updatedLabels.splice(index, 1);
    onLabelsChange(updatedLabels);
  };

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Labels</Label>

      <div className="flex flex-wrap gap-2">
        {labels.map((label, index) => {
          const colorConfig =
            labelColors.find((c) => c.name === label.color) ?? labelColors[7];
          return (
            <Badge
              key={index}
              className={`${colorConfig.bg} ${colorConfig.text} gap-1 border-none`}
            >
              {label.text}
              <button
                type="button"
                onClick={() => handleRemoveLabel(index)}
                className="ml-1 flex h-3 w-3 items-center justify-center rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              >
                <X className="h-2 w-2" />
              </button>
            </Badge>
          );
        })}

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 rounded-full px-2 text-xs"
            >
              <Plus className="mr-1 h-3 w-3" /> Add Label
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Add a Label</h4>
              <Input
                className="h-8 text-sm"
                placeholder="Label text..."
                value={newLabelText}
                onChange={(e) => setNewLabelText(e.target.value)}
              />

              <div className="space-y-1">
                <Label className="text-xs">Color</Label>
                <div className="flex flex-wrap gap-1">
                  {labelColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      className={`${color.bg} ${color.text} h-6 w-6 rounded-full border ${
                        selectedColor === color.name
                          ? "ring-2 ring-offset-1"
                          : ""
                      }`}
                      onClick={() => handleColorSelect(color.name)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    handleAddLabel();
                    setIsOpen(false);
                  }}
                  disabled={!newLabelText.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
