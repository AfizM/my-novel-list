import React, { useState, useEffect, useCallback } from "react";
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
  const [userNovelStatus, setUserNovelStatus] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    const fetchUserNovelStatus = async () => {
      if (!novel) return;

      try {
        const response = await fetch(`/api/novel-list/${novel.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserNovelStatus(data.status);
        }
      } catch (error) {
        console.error("Error fetching novel status:", error);
      }
    };

    fetchUserNovelStatus();
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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleDelete = async () => {
    if (!novel) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/novel-list/${novel.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete novel from list");
      }

      toast.success(`${novel.name} removed from your list`);
      onUpdateComplete();
      onClose();
    } catch (error) {
      console.error("Error deleting novel from list:", error);
      toast.error("Failed to remove novel from list. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ProgressBar isLoading={isInitialLoading} />
      {!isInitialLoading ? (
        <div className="flex flex-col space-y-6 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold line-clamp-1">
              {novel.name}
            </h2>
            <button
              onClick={toggleFavorite}
              className="focus:outline-none shrink-0"
            >
              {isFavorite ? (
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 fill-current" />
              ) : (
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
              )}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-6 sm:space-y-0">
            <div className="w-full sm:w-1/3 flex justify-center sm:block">
              <img
                src={novel.cover_image_url}
                alt={novel.name}
                className="w-32 sm:w-full max-w-[200px] h-auto rounded-md shadow-md"
              />
            </div>

            <div className="w-full sm:w-2/3 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                <label className="text-sm font-medium sm:w-1/3">Status:</label>
                <div className="w-full sm:w-2/3">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                <label className="text-sm font-medium sm:w-1/3">
                  Chapters read:
                </label>
                <div className="w-full sm:w-2/3">
                  <Input
                    type="number"
                    placeholder="Chapter progress"
                    value={chapterProgress}
                    onChange={(e) => setChapterProgress(e.target.value)}
                    min="0"
                    max="10000"
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      if (parseInt(input.value) > 10000) {
                        input.value = "10000";
                        setChapterProgress("10000");
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                <label className="text-sm font-medium sm:w-1/3">
                  Overall rating:
                </label>
                <div className="flex items-center sm:w-2/3">
                  {renderStars()}
                  <span className="ml-2 text-sm">
                    {rating > 0 ? `${rating}/5` : "Not rated"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                <label className="text-sm font-medium sm:w-1/3 sm:pt-2">
                  Notes:
                </label>
                <Textarea
                  placeholder="Add your notes here"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="sm:w-2/3 min-h-28"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            {novelData && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting || isLoading}
                className="hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
              >
                {isDeleting ? "Removing..." : "Delete"}
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isLoading || isDeleting}
              className={novelData ? "" : "ml-auto"}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      ) : null}
    </>
  );
}
