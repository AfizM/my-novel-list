import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewId: string;
  initialReview: string;
  onReviewUpdated: () => void;
}

export default function EditReviewDialog({
  open,
  onOpenChange,
  reviewId,
  initialReview,
  onReviewUpdated,
}: EditReviewDialogProps) {
  const [reviewText, setReviewText] = useState(initialReview);

  useEffect(() => {
    setReviewText(initialReview);
  }, [initialReview]);

  const handleUpdateReview = async () => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          review_description: reviewText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      await response.json();
      onReviewUpdated();
      onOpenChange(false);
      toast.success("Review updated successfully");
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Failed to update review. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Review</DialogTitle>
        </DialogHeader>
        <Textarea
          className="h-52 mt-3 resize-none"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <Button onClick={handleUpdateReview}>Update Review</Button>
      </DialogContent>
    </Dialog>
  );
}
