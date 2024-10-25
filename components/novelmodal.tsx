// @ts-nocheck
import React, { useState, useEffect } from "react";
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
import { Star, StarHalf, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ProgressBar from "./ProgressBar";

type NovelModalProps = {
  novel: {
    id: number;
    name: string;
    cover_image_url: string;
    rating: number;
    chapters_original_current: string;
    original_language: string;
  } | null;
  onClose: () => void;
  onUpdateComplete: () => void;
};

export function NovelModal({
  novel,
  onClose,
  onUpdateComplete,
}: NovelModalProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [novelData, setNovelData] = useState(null);
  const [status, setStatus] = useState("reading");
  const [chapterProgress, setChapterProgress] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialStatus, setInitialStatus] = useState("");
  const [initialChapterProgress, setInitialChapterProgress] = useState("");
  const [initialRating, setInitialRating] = useState(0);
  const [initialNotes, setInitialNotes] = useState("");
  const [initialIsFavorite, setInitialIsFavorite] = useState(false);

  useEffect(() => {
    const fetchNovelListData = async () => {
      if (!novel) return;
      setIsInitialLoading(true);
      try {
        const response = await fetch(`/api/novel-list/${novel.id}`);
        if (!response.ok) throw new Error("Failed to fetch novel data");
        const data = await response.json();
        setNovelData(data);
        setStatus(data.status);
        setChapterProgress(data.chapter_progress?.toString() || "");
        setRating(data.rating);
        setNotes(data.notes);
        setIsFavorite(data.is_favorite);
        setInitialStatus(data.status);
        setInitialChapterProgress(data.chapter_progress?.toString() || "");
        setInitialRating(data.rating);
        setInitialNotes(data.notes);
        setInitialIsFavorite(data.is_favorite);
      } catch (error) {
        console.error("Error fetching novel list data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchNovelListData();
  }, [novel]);

  if (!novel) return null;

  const handleSave = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/novel-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          novel_id: novel.id,
          status,
          chapter_progress:
            chapterProgress === "" ? null : parseInt(chapterProgress, 10),
          rating,
          notes,
          is_favorite: isFavorite,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save novel to list");
      }

      const updatedNovel = await response.json();

      // Call the onUpdate callback with the updated novel
      onUpdateComplete();

      // Check for changes
      const hasStatusChanged = status !== initialStatus;
      const hasChapterProgressChanged =
        chapterProgress !== initialChapterProgress;
      const hasRatingChanged = rating !== initialRating;
      const hasNotesChanged = notes !== initialNotes;
      const hasFavoriteChanged = isFavorite !== initialIsFavorite;

      // Create post if there are any changes
      if (hasStatusChanged || hasChapterProgressChanged) {
        let postContent = "";

        if (status === "completed") {
          postContent = `Completed ${novel.name}`;
        } else if (status === "planning") {
          postContent = chapterProgress
            ? `Plans to read ${chapterProgress} chapters of ${novel.name}`
            : `Plans to read ${novel.name}`;
        } else if (status === "reading") {
          postContent = chapterProgress
            ? `Read chapter ${chapterProgress} of ${novel.name}`
            : `Started Reading ${novel.name}`;
        }

        if (postContent) {
          await fetch("/api/posts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              novel_id: novel.id,
              content: postContent.trim(),
            }),
          });
        }
      }

      toast.success(`${novel.name} list entry updated`);
      onClose();
    } catch (error) {
      console.error("Error saving novel to list:", error);
      setError("Failed to save. Please try again.");
      toast.error("Failed to update list entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingHover = (star: number, isHalf: boolean) => {
    setHoverRating(isHalf ? star - 0.5 : star);
  };

  const handleRatingClick = (star: number, isHalf: boolean) => {
    setRating(isHalf ? star - 0.5 : star);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const starValue = hoverRating || rating;
      stars.push(
        <div key={i} className="relative inline-block">
          <Star
            className={`cursor-pointer ${
              starValue >= i
                ? "text-[var(--orange-rating)] fill-[var(--orange-rating)]"
                : "text-gray-300"
            }`}
            onMouseEnter={() => handleRatingHover(i, false)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRatingClick(i, false)}
          />
          {starValue > i - 1 && starValue < i && (
            <StarHalf
              className="cursor-pointer text-[var(--orange-rating)] fill-[var(--orange-rating)] absolute top-0 left-0"
              onMouseEnter={() => handleRatingHover(i, true)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => handleRatingClick(i, true)}
            />
          )}
        </div>,
      );
    }
    return stars;
  };

  const refetchUserStats = async () => {
    try {
      const response = await fetch(`/api/users/${novel.user_id}/stats`);
      if (!response.ok) throw new Error("Failed to fetch user stats");
      const data = await response.json();
      onUpdateStats();
    } catch (error) {
      console.error("Error refetching user stats:", error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <>
      <ProgressBar isLoading={isInitialLoading} />
      {!isInitialLoading ? (
        <div className="flex flex-col space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{novel.name}</h2>
            <button onClick={toggleFavorite} className="focus:outline-none">
              {isFavorite ? (
                <Heart className="h-6 w-6 text-red-500 fill-current" />
              ) : (
                <Heart className="h-6 w-6 text-gray-400" />
              )}
            </button>
          </div>
          <div className="flex space-x-6">
            <div className="w-1/3">
              <img
                src={novel.cover_image_url}
                alt={novel.name}
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
                <label className="w-1/3 text-sm font-medium">
                  Chapters read:
                </label>
                <Input
                  type="number"
                  placeholder="Chapter progress"
                  value={chapterProgress}
                  onChange={(e) => setChapterProgress(e.target.value)}
                  className="w-2/3"
                />
              </div>

              <div className="flex items-center">
                <label className="w-1/3 text-sm font-medium">
                  Overall rating:
                </label>
                <div className="flex items-center w-2/3">
                  {renderStars()}
                  <span className="ml-2 text-sm">
                    {rating > 0 ? `${rating}/5` : "Not rated"}
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
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      ) : null}
    </>
  );
}
