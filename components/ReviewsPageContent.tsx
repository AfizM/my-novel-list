// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { ReviewCard } from "@/components/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  novel_id: number;
  rating: number;
  review_description: string;
  likes: number;
  is_liked: boolean;
  created_at: string;
  users: {
    username: string;
    image_url: string;
  };
  novels: {
    id: number;
    name: string;
    cover_image_url: string;
  };
  review_comments: {
    id: string;
    comment: string;
    created_at: string;
    likes: number;
    is_liked: boolean;
    users: {
      username: string;
      image_url: string;
    };
  }[];
}

interface ReviewsPageContentProps {
  user: {
    user_id: string;
    username: string;
  };
}

export default function ReviewsPageContent({ user }: ReviewsPageContentProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("recent");
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());

  const fetchReviews = async (pageNum = 1) => {
    setIsReviewsLoading(true);
    try {
      const response = await fetch(
        `/api/users/${user.username}/reviews?page=${pageNum}&sort=${sort}`,
      );
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();

      // Ensure reviews have the correct structure
      const formattedReviews = data.reviews.map((review) => ({
        ...review,
        review_comments: review.review_comments || [],
        users: review.users || { username: "Unknown User", image_url: "" },
      }));

      setReviews((prevReviews) =>
        pageNum === 1
          ? formattedReviews
          : [...prevReviews, ...formattedReviews],
      );
      console.log(reviews);
      setHasMore(data.hasMore);
    } catch (err) {
      setError("An error occurred while fetching reviews. Please try again.");
    } finally {
      setIsReviewsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setReviews([]);
    fetchReviews(1);
  }, [user.username, sort]);

  useEffect(() => {
    if (page > 1) {
      fetchReviews(page);
    }
  }, [page]);

  const handleLike = async (
    reviewId: string,
    isLiked: boolean,
    likes: number,
  ) => {
    if (pendingLikes.has(reviewId)) return;

    try {
      setPendingLikes((prev) => new Set(prev).add(reviewId));

      // Optimistic update
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                is_liked: !review.is_liked,
                likes: review.is_liked ? review.likes - 1 : review.likes + 1,
              }
            : review,
        ),
      );

      const response = await fetch(`/api/reviews/${reviewId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to update like");

      const data = await response.json();

      // Update with server response
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                is_liked: data.action === "liked",
                likes: data.likes,
              }
            : review,
        ),
      );
    } catch (error) {
      // Revert on error
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? { ...review, is_liked: isLiked, likes: likes }
            : review,
        ),
      );
      toast.error("Failed to update like");
    } finally {
      setPendingLikes((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  };

  const handleComment = async (reviewId: string, newComment: string) => {
    try {
      const response = await fetch(`/api/reviews/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: reviewId, comment: newComment }),
      });

      if (!response.ok) throw new Error("Failed to add comment");
      const addedComment = await response.json();

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                review_comments: [
                  ...(review.review_comments || []),
                  addedComment,
                ],
              }
            : review,
        ),
      );
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  const handleCommentLike = async (
    reviewId: string,
    commentId: string,
    isLiked: boolean,
    newLikes: number,
  ) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              review_comments: review.review_comments?.map((comment) =>
                comment.id === commentId
                  ? { ...comment, is_liked: isLiked, likes: newLikes }
                  : comment,
              ),
            }
          : review,
      ),
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[1.24rem] font-semibold leading-none tracking-tight mb-2">
          {user.username}&apos;s Reviews
        </h2>
        <Select value={sort} onValueChange={(value) => setSort(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="likes">Most Liked</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-6">
        {isReviewsLoading && page === 1 ? (
          <div className="mt-4">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onLike={handleLike}
                onComment={handleComment}
                onCommentLike={handleCommentLike}
                showNovel={true}
                currentUserId={user.user_id}
              />
            ))}
            {hasMore && (
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={isReviewsLoading}
                className="mt-4"
              >
                {isReviewsLoading ? "Loading..." : "Load More Reviews"}
              </Button>
            )}
          </>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            No reviews found.
          </div>
        )}
      </div>
    </div>
  );
}
