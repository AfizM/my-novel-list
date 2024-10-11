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

type RatingCategory = "plot" | "characters" | "worldBuilding" | "writingStyle";

export default function WriteReviewDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const totalStars = 5;
  const [ratings, setRatings] = useState<Record<RatingCategory, number>>({
    plot: 0,
    characters: 0,
    worldBuilding: 0,
    writingStyle: 0,
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

  const [reviewText, setReviewText] = useState("");

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const allRatingsProvided = Object.values(ratings).every(
      (rating) => rating > 0,
    );
    setIsFormValid(allRatingsProvided && reviewText.length >= 20);
  }, [ratings, reviewText]);

  const handleSubmitReview = () => {
    // Implement your review submission logic here
    console.log("Submitting review:", { ratings, reviewText });
    onOpenChange(false); // Close the dialog after submission
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl">Write a Review</DialogTitle>
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
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
