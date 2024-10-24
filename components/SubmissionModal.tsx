import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Submission {
  id: string;
  name: string;
  description: string;
  // Add other fields as needed
}

interface SubmissionModalProps {
  submission: Submission;
  onClose: () => void;
  onUpdate: () => void;
}

export function SubmissionModal({
  submission,
  onClose,
  onUpdate,
}: SubmissionModalProps) {
  const [editedSubmission, setEditedSubmission] = useState(submission);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditedSubmission((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedSubmission),
      });

      if (!response.ok) {
        throw new Error("Failed to update submission");
      }

      toast.success("Submission updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating submission:", error);
      toast.error("Failed to update submission");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Submission</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            name="name"
            value={editedSubmission.name}
            onChange={handleInputChange}
            placeholder="Novel Name"
          />
          <Textarea
            name="description"
            value={editedSubmission.description}
            onChange={handleInputChange}
            placeholder="Description"
          />
          {/* Add other fields as needed */}
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
