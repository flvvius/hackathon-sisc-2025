"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export default function TaskDialogTest() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 rounded-md border border-green-500 p-4">
      <h2 className="mb-4 text-lg font-bold">Dialog Test</h2>
      <Button
        variant="default"
        className="bg-green-500 hover:bg-green-600"
        onClick={() => setIsOpen(true)}
      >
        Open Test Dialog
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>This is a test dialog to verify it works.</p>
          </div>
          <Button onClick={() => setIsOpen(false)}>Close Dialog</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
