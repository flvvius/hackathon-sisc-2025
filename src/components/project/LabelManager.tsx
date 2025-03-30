"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Edit2, Plus, Tag, Trash2, X } from "lucide-react";
import { useLabels, LABEL_COLORS } from "~/hooks/useLabels";
import type { Label } from "~/server/actions/labels";

export default function LabelManager({ boardId }: { boardId: string }) {
  const [isAddLabelOpen, setIsAddLabelOpen] = useState(false);
  const [isEditLabelOpen, setIsEditLabelOpen] = useState(false);
  const [labelText, setLabelText] = useState("");
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].name);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    labels,
    isLoading,
    error,
    createBoardLabel,
    updateBoardLabel,
    deleteBoardLabel,
  } = useLabels();

  const handleCreateLabel = async () => {
    if (!labelText.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await createBoardLabel(labelText, selectedColor);
      if (success) {
        setLabelText("");
        setSelectedColor(LABEL_COLORS[0].name);
        setIsAddLabelOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLabel = async () => {
    if (!editingLabel || !labelText.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await updateBoardLabel(editingLabel.id, {
        text: labelText,
        color: selectedColor,
      });
      if (success) {
        setEditingLabel(null);
        setLabelText("");
        setSelectedColor(LABEL_COLORS[0].name);
        setIsEditLabelOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    await deleteBoardLabel(labelId);
  };

  const startEditLabel = (label: Label) => {
    setEditingLabel(label);
    setLabelText(label.text);
    setSelectedColor(label.color);
    setIsEditLabelOpen(true);
  };

  // Helper to get color info
  const getColorConfig = (colorName: string) => {
    return (
      LABEL_COLORS.find((c) => c.name === colorName) ??
      LABEL_COLORS[LABEL_COLORS.length - 1]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Tag className="mr-2 h-5 w-5" /> Labels
        </CardTitle>
        <CardDescription>
          Create and manage labels for your board
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-pulse">Loading labels...</div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="space-y-4">
            {labels.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center">
                No labels yet. Create labels to categorize your tasks.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {labels.map((label) => {
                  const colorConfig = getColorConfig(label.color);
                  return (
                    <div
                      key={label.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-4 w-4 rounded-full ${colorConfig.bg}`}
                        />
                        <span className="font-medium">{label.text}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditLabel(label)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteLabel(label.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isAddLabelOpen} onOpenChange={setIsAddLabelOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Label
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Label</DialogTitle>
              <DialogDescription>
                Add a new label to categorize tasks
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label
                  htmlFor="labelText"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Label Text
                </label>
                <Input
                  id="labelText"
                  placeholder="Enter label text"
                  value={labelText}
                  onChange={(e) => setLabelText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`h-8 w-full rounded-md ${color.bg} ${
                        selectedColor === color.name
                          ? "ring-2 ring-black ring-offset-2"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-2">
                <p className="mb-2 text-sm font-medium">Preview:</p>
                <div
                  className={`${getColorConfig(selectedColor).bg} ${
                    getColorConfig(selectedColor).text
                  } inline-block rounded-full px-3 py-1 text-sm`}
                >
                  {labelText || "Label preview"}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddLabelOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateLabel}
                disabled={!labelText.trim() || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Label"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditLabelOpen} onOpenChange={setIsEditLabelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Label</DialogTitle>
              <DialogDescription>
                Update the label text or color
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label
                  htmlFor="editLabelText"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Label Text
                </label>
                <Input
                  id="editLabelText"
                  placeholder="Enter label text"
                  value={labelText}
                  onChange={(e) => setLabelText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`h-8 w-full rounded-md ${color.bg} ${
                        selectedColor === color.name
                          ? "ring-2 ring-black ring-offset-2"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-2">
                <p className="mb-2 text-sm font-medium">Preview:</p>
                <div
                  className={`${getColorConfig(selectedColor).bg} ${
                    getColorConfig(selectedColor).text
                  } inline-block rounded-full px-3 py-1 text-sm`}
                >
                  {labelText || "Label preview"}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditLabelOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateLabel}
                disabled={!labelText.trim() || isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Label"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
