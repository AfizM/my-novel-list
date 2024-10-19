"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

type RatingCategory = "plot" | "characters" | "worldBuilding" | "writingStyle";

interface WriteReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  novelId: number;
  onReviewCreated: () => void;
  existingReview?: {
    id: string;
    rating: number;
    review_description: string;
    plot_rating: number;
    characters_rating: number;
    world_building_rating: number;
    writing_style_rating: number;
  };
}

export default function WriteReviewDialog({
  open,
  onOpenChange,
  novelId,
  onReviewCreated,
  existingReview,
}: WriteReviewDialogProps) {
  const totalStars = 5;
  const [ratings, setRatings] = useState<Record<RatingCategory, number>>({
    plot: existingReview?.plot_rating || 0,
    characters: existingReview?.characters_rating || 0,
    worldBuilding: existingReview?.world_building_rating || 0,
    writingStyle: existingReview?.writing_style_rating || 0,
  });

  const totalScore = useMemo(() => {
    const sum = Object.values(ratings).reduce((acc, curr) => acc + curr, 0);
    return sum / Object.keys(ratings).length;
  }, [ratings]);

  const handleRatingChange = (category: RatingCategory, rating: number) => {
    setRatings((prev) => ({ ...prev, [category]: rating }));
  };

  const RatingStars = ({ category }: { category: RatingCategory }) => (
    <div className="flex">
      {[...Array(totalStars)].map((_, index) => (
        <Star
          key={index}
          size={20}
          className={`cursor-pointer ${
            index < ratings[category]
              ? "text-[var(--orange-rating)] fill-[var(--orange-rating)]"
              : "text-gray-300"
          }`}
          onClick={() => handleRatingChange(category, index + 1)}
        />
      ))}
    </div>
  );

  const [reviewText, setReviewText] = useState(
    existingReview?.review_description || "",
  );
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const allRatingsProvided = Object.values(ratings).every(
      (rating) => rating > 0,
    );
    setIsFormValid(allRatingsProvided && reviewText.length >= 20);
  }, [ratings, reviewText]);

  const handleSubmitReview = async () => {
    try {
      const method = existingReview ? "PUT" : "POST";
      const url = existingReview
        ? `/api/reviews/${existingReview.id}`
        : "/api/reviews";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          novel_id: novelId,
          rating: totalScore,
          review_description: reviewText,
          plot_rating: ratings.plot,
          characters_rating: ratings.characters,
          world_building_rating: ratings.worldBuilding,
          writing_style_rating: ratings.writingStyle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      await response.json();
      onReviewCreated();
      onOpenChange(false);
      toast.success(
        existingReview
          ? "Review updated successfully"
          : "Review submitted successfully",
      );
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {existingReview ? "Edit Review" : "Write a Review"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex space-x-10">
          {/* Left Column with Ratings */}
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center space-x-20">
              <div>Plot</div>
              <RatingStars category="plot" />
            </div>
            <div className="flex justify-between items-center space-x-20">
              <div>Characters</div>
              <RatingStars category="characters" />
            </div>
            <div className="flex justify-between items-center space-x-20">
              <div>World Building</div>
              <RatingStars category="worldBuilding" />
            </div>
            <div className="flex justify-between items-center space-x-20">
              <div>Writing Style</div>
              <RatingStars category="writingStyle" />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className=" w-full max-w-40 min-h-26 p-4 rounded-lg border">
              <div className="flex-col text-center ">
                <div>The total score</div>
                <div className="text-3xl font-bold">
                  {totalScore.toFixed(1)}
                </div>
                <div className="flex justify-center mt-2">
                  {[...Array(totalStars)].map((_, index) => (
                    <Star
                      key={index}
                      size={20}
                      className={`${
                        index < Math.round(totalScore)
                          ? "text-[var(--orange-rating)] fill-[var(--orange-rating)]"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Textarea
          className="h-52 mt-3 resize-none"
          placeholder="Type your review here (minimum 20 characters)."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmitReview}
            disabled={!isFormValid}
          >
            {existingReview ? "Update" : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
