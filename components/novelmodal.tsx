import React, { useState } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

type NovelModalProps = {
  novel: {
    id: number;
    title: string;
    image: string;
    score: number;
    chapterProgress: number;
    country: string;
  } | null;
};

export function NovelModal({ novel }: NovelModalProps) {
  const [status, setStatus] = useState("reading");
  const [chapterProgress, setChapterProgress] = useState(
    novel?.chapterProgress || 0,
  );
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");

  if (!novel) return null;

  const handleSave = () => {
    // Handle submit logic here
    console.log({ status, chapterProgress, rating, notes });
  };

  return (
    <div className="flex flex-col space-y-6 pt-4">
      <div className="flex space-x-6">
        <div className="w-1/3">
          <Image
            src={novel.image}
            alt={novel.title}
            width={200}
            height={300}
            className="rounded-md"
          />
        </div>
        <div className="w-2/3 space-y-6">
          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium">Status:</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-2/3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium">Chapters read:</label>
            <Input
              type="number"
              placeholder="Chapter progress"
              value={chapterProgress}
              onChange={(e) => setChapterProgress(Number(e.target.value))}
              className="w-2/3"
            />
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-sm font-medium">Overall rating:</label>
            <div className="flex items-center w-2/3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`cursor-pointer ${
                    star <= rating / 2
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => setRating(star * 2)}
                />
              ))}
              <span className="ml-2 text-sm">
                {rating > 0 ? `${rating}/10` : "Not rated"}
              </span>
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-1/3 text-sm font-medium pt-2">Notes:</label>
            <Textarea
              placeholder="Add your notes here"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-2/3 min-h-28"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}
