import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Submission {
  id: string;
  name: string;
  original_language: string;
  authors: string[];
  genres: string[];
  original_publisher: string;
  description: string;
  complete_original: boolean;
  cover_image_url?: string;
}

interface SubmissionModalProps {
  submission: Submission;
  onClose: () => void;
}

export function SubmissionModal({ submission, onClose }: SubmissionModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Submission</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pr-2">
          <div className="flex gap-4">
            {/* Cover Image */}
            <div className="w-32 flex-shrink-0">
              <img
                src={submission.cover_image_url || "/img/placeholder-cover.jpg"}
                alt={`Cover for ${submission.name}`}
                className="w-full aspect-[2/3] object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.src = "/img/placeholder-cover.jpg";
                }}
              />
            </div>

            {/* Basic Info */}
            <div className="space-y-3 flex-grow">
              <div>
                <Label className="text-sm text-muted-foreground">
                  Novel Name
                </Label>
                <Input
                  value={submission.name}
                  readOnly
                  className="bg-muted cursor-default"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">
                  Original Language
                </Label>
                <Input
                  value={submission.original_language}
                  readOnly
                  className="bg-muted cursor-default"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Authors</Label>
            <Input
              value={submission.authors.join(", ")}
              readOnly
              className="bg-muted cursor-default"
            />
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Genres</Label>
            <Input
              value={submission.genres.join(", ")}
              readOnly
              className="bg-muted cursor-default"
            />
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">
              Original Publisher
            </Label>
            <Input
              value={submission.original_publisher}
              readOnly
              className="bg-muted cursor-default"
            />
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">Description</Label>
            <Textarea
              value={submission.description}
              readOnly
              className="bg-muted cursor-default min-h-[80px] resize-none"
            />
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">
              Cover Image URL
            </Label>
            <Input
              value={submission.cover_image_url || ""}
              readOnly
              className="bg-muted cursor-default"
            />
          </div>

          <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
            <Checkbox
              checked={submission.complete_original}
              disabled
              className="cursor-default"
            />
            <div className="space-y-1 leading-none">
              <Label className="text-sm font-medium">
                Complete in Original Language
              </Label>
              <p className="text-sm text-muted-foreground">
                Is the novel complete in its original language?
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
