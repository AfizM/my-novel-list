import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface TagManagementProps {
  tags: string[];
  onUpdateTags: (tags: string[]) => Promise<void>;
}

export function TagManagement({ tags, onUpdateTags }: TagManagementProps) {
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editedTagValue, setEditedTagValue] = useState("");

  const handleEditTag = (tag: string) => {
    setEditingTag(tag);
    setEditedTagValue(tag);
  };

  const handleSaveTag = async () => {
    if (editingTag && editedTagValue.trim()) {
      const updatedTags = tags.map((tag) =>
        tag === editingTag ? editedTagValue.trim() : tag,
      );
      try {
        await onUpdateTags(updatedTags);
        setEditingTag(null);
        toast.success("Tag updated successfully");
      } catch (error) {
        toast.error("Failed to update tag. Please try again.");
      }
    }
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToDelete);
    try {
      await onUpdateTags(updatedTags);
      toast.success("Tag deleted successfully");
    } catch (error) {
      toast.error("Failed to delete tag. Please try again.");
    }
  };

  return (
    <div className="space-y-2">
      {tags.map((tag) => (
        <div key={tag} className="flex items-center space-x-2">
          {editingTag === tag ? (
            <>
              <Input
                value={editedTagValue}
                onChange={(e) => setEditedTagValue(e.target.value)}
              />
              <Button onClick={handleSaveTag}>Save</Button>
              <Button variant="outline" onClick={() => setEditingTag(null)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <span>{tag}</span>
              <Button variant="outline" onClick={() => handleEditTag(tag)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteTag(tag)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
