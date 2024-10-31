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
  onReleaseFreqChange: (value: number[]) => void;
  releaseFreq: number;
  onOriginChange: (value: string) => void;
  origin: string;
}

const ORIGINS = ["Any", "Chinese", "Korean", "Japanese", "Malaysian"];

export function FiltersPanel({
  isOpen,
  onChapterChange,
  chapterCount,
  onReleaseFreqChange,
  releaseFreq,
  onOriginChange,
  origin,
}: FiltersPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-[calc(100%+0.5rem)] w-[300px] p-4 border rounded-lg bg-background shadow-md space-y-6 animate-in slide-in-from-top-2 z-50">
      <div className="space-y-2">
        <label className="text-sm font-medium">Country of Origin</label>
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
        <label className="text-sm font-medium">Chapters ({chapterCount})</label>
        <Slider
          defaultValue={[chapterCount]}
          max={5000}
          step={1}
          onValueChange={(value) => onChapterChange(value)}
          className="py-4"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Release Frequency ({releaseFreq} chapters/month)
        </label>
        <Slider
          defaultValue={[releaseFreq]}
          max={1000}
          step={1}
          onValueChange={(value) => onReleaseFreqChange(value)}
          className="py-4"
        />
      </div>
    </div>
  );
}
