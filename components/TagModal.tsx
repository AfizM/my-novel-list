import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTag: (tag: string) => Promise<void>;
  existingTags: string[];
}

export function TagModal({
  isOpen,
  onClose,
  onAddTag,
  existingTags,
}: TagModalProps) {
  const [newTag, setNewTag] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (newTag.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/novels/tags/suggestions?q=${encodeURIComponent(newTag)}`,
        );
        if (!response.ok) throw new Error("Failed to fetch suggestions");
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [newTag]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      try {
        await onAddTag(newTag.trim());
        setNewTag("");
        toast.success("Tag added successfully");
      } catch (error) {
        toast.error("Failed to add tag. Please try again.");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col min-h-0">
        <DialogHeader>
          <DialogTitle>Add New Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter new tag"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setNewTag(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button type="submit">Add Tag</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
