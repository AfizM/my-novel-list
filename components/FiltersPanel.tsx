"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface FiltersPanelProps {
  isOpen: boolean;
  onChapterChange: (value: number[]) => void;
  chapterCount: number;
  onOriginChange: (value: string) => void;
  origin: string;
}

const ORIGINS = ["Any", "Chinese", "Korean", "Japanese"];

export function FiltersPanel({
  isOpen,
  onChapterChange,
  chapterCount,

  onOriginChange,
  origin,
}: FiltersPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-[calc(100%+0.5rem)] w-[300px] p-4 border rounded-lg bg-background shadow-md space-y-6 animate-in slide-in-from-top-2 z-50">
      <div className="space-y-2">
        <label className="text-sm font-medium">Original Language</label>
        <Select value={origin} onValueChange={onOriginChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select origin" />
          </SelectTrigger>
          <SelectContent>
            {ORIGINS.map((origin) => (
              <SelectItem key={origin} value={origin.toLowerCase()}>
                {origin}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Minimum Chapters ({chapterCount > 0 ? chapterCount : "Any"})
        </label>
        <Slider
          defaultValue={[chapterCount]}
          max={5000}
          step={10}
          onValueCommit={(value) => onChapterChange(value)}
          className="py-4"
        />
      </div>
    </div>
  );
}
