// @ts-nocheck
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Star, ChevronDown, SquarePen, Eye, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { notFound } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { NovelModal } from "@/components/novelmodal";
import WriteReviewDialog from "@/components/write-a-review-dialog";
import { useUser } from "@clerk/nextjs";
import { ReviewCard } from "@/components/ReviewCard";
import { toast } from "sonner";
import { capitalizeFirstLetter } from "@/utils/capitalize";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { TagModal } from "@/components/TagModal";
import { TagManagement } from "@/components/TagManagement";

interface Novel {
  id: number;
  name: string;
  assoc_names: string[];
  original_language: string;
  authors: string[];
  genres: string[];
  tags: string[];
  cover_image_url: string;
  start_year: number;
  licensed: boolean;
  original_publisher: string;
  english_publisher: string;
  complete_original: boolean;
  chapters_original_current: string;
  complete_translated: boolean;
  chapter_latest_translated: string;
  release_freq: number;
  on_reading_lists: number;
  reading_list_all_time_rank: number;
  rating: number;
  rating_votes: number;
  recommended_series_ids: number[];
  created_at: string;
  updated_at: string;
  description: string;
}

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export default function NovelPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userReview, setUserReview] = useState<any>(null);
  const [userNovelStatus, setUserNovelStatus] = useState<string | null>(null);
  const [cache, setCache] = useState<{
    novel: Novel | null;
    timestamp: number;
  } | null>(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const debouncedLoading = useDebounce(isLoading, 200);

  const fetchUserNovelStatus = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/novel-list/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setUserNovelStatus(data.status);
      }
    } catch (error) {
      console.error("Error fetching novel status:", error);
    }
  }, [params.id, user]);

  useEffect(() => {
    fetchUserNovelStatus();
  }, [fetchUserNovelStatus]);

  const fetchNovel = useCallback(async () => {
    if (cache && Date.now() - cache.timestamp < CACHE_TIME) {
      setNovel(cache.novel);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/novels/${params.id}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch novel");
      const data = await res.json();
      setNovel(data);
      setCache({ novel: data, timestamp: Date.now() });
    } catch (err) {
      console.error("Error fetching novel:", err);
      setError("Failed to fetch novel");
    } finally {
      setIsLoading(false);
    }
  }, [params.id, cache]);

  useEffect(() => {
    fetchNovel();
  }, [fetchNovel]);

  useEffect(() => {
    setReviews([]);
    setPage(1);
    fetchReviews();
    fetchUserReview();
  }, [params.id]);

  useEffect(() => {
    if (page > 1) {
      fetchReviews();
    }
  }, [page]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `/api/reviews/${parseInt(params.id)}?page=${page}&limit=10`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await response.json();
      setReviews((prevReviews) =>
        page === 1 ? data.reviews : [...prevReviews, ...data.reviews],
      );
      setHasMore(data.reviews.length === 10);
      if (data.reviews.length === 0 && page > 1) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to fetch reviews. Please try again.");
    }
  };

  const fetchUserReview = async () => {
    try {
      const response = await fetch(`/api/novels/${params.id}/user-review`);
      if (response.ok) {
        const data = await response.json();
        setUserReview(data);
      }
    } catch (error) {
      console.error("Error fetching user review:", error);
    }
  };

  const handleLike = async (
    reviewId: string,
    isLiked: boolean,
    newLikes: number,
  ) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId
          ? { ...review, is_liked: isLiked, likes: newLikes }
          : review,
      ),
    );
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
                review_comments: [...review.review_comments, addedComment],
              }
            : review,
        ),
      );
    } catch (error) {
      console.error("Error adding comment:", error);
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
              review_comments: review.review_comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, is_liked: isLiked, likes: newLikes }
                  : comment,
              ),
            }
          : review,
      ),
    );
  };

  const handleReviewCreated = async () => {
    setIsReviewDialogOpen(false);
    setReviews([]);
    setPage(1);
    await fetchReviews();
    await fetchUserReview();
  };

  const handleEditReview = () => {
    setIsReviewDialogOpen(true);
  };

  const handleAddTag = async (tag: string) => {
    try {
      const response = await fetch(`/api/novels/${params.id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
      });

      if (!response.ok) throw new Error("Failed to add tag");

      const updatedNovel = await response.json();
      setNovel(updatedNovel);
      setIsTagModalOpen(false);
    } catch (error) {
      console.error("Error adding tag:", error);
      throw error;
    }
  };

  const handleUpdateTags = async (updatedTags: string[]) => {
    try {
      const response = await fetch(`/api/novels/${params.id}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updatedTags }),
      });

      if (!response.ok) throw new Error("Failed to update tags");

      const updatedNovel = await response.json();
      setNovel(updatedNovel);
    } catch (error) {
      console.error("Error updating tags:", error);
      throw error;
    }
  };

  const handleUpdateComplete = () => {
    fetchUserNovelStatus();
  };

  if (debouncedLoading) {
    return <NovelSkeleton />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!novel) {
    notFound();
  }

  return (
    <div>
      <div className="w-full max-w-[1100px] mx-auto my-0 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row mt-8 p-6 border shadow-lg rounded-lg bg-white dark:bg-gray-800">
          {/* Image */}
          <div className="flex flex-col items-center md:mr-6 shrink-0 mb-6 md:mb-0">
            <img
              src={novel.cover_image_url || "/img/novel1.jpg"}
              alt={novel.name || "Novel cover"}
              className="w-full max-w-[200px] md:max-w-[240px] object-cover rounded-md"
            />
            <Button
              className="mt-2.5 w-full relative max-w-48"
              onClick={() => setIsModalOpen(true)}
            >
              {userNovelStatus ? (
                <>
                  {userNovelStatus.charAt(0).toUpperCase() +
                    userNovelStatus.slice(1)}
                  <ChevronDown className="absolute right-2" />
                </>
              ) : (
                <>
                  Add to list
                  <ChevronDown className="absolute right-2" />
                </>
              )}
            </Button>
          </div>

          <div className="flex-grow space-y-6">
            {/* Title */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 hover:text-green-600 transition-colors">
                {novel.name || "Untitled Novel"}
              </h1>
            </div>

            {/* Ratings */}
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-5 h-5 ${
                    index < Math.floor(novel.rating || 0)
                      ? "text-[var(--orange-rating)] fill-[var(--orange-rating)]"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <div className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                {novel.rating != null ? novel.rating.toFixed(1) : "N/A"}

                <span className="ml-1">
                  ({novel.rating_votes ?? 0} ratings)
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-inner">
              <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Description
              </h2>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {novel.description || "No description available."}
              </p>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <DetailItem
                label="Author"
                value={novel.authors?.[0] || "Unknown"}
              />
              <DetailItem
                label="Original Publisher"
                value={novel.original_publisher || "Unknown"}
              />
              <DetailItem
                label="Original Language"
                value={novel.original_language || "Unknown"}
              />
              <DetailItem
                label="Chapters"
                value={novel.chapters_original_current || "Unknown"}
              />
              <DetailItem
                label="Status"
                value={
                  novel.complete_original != null
                    ? novel.complete_original
                      ? "Completed"
                      : "Ongoing"
                    : "Unknown"
                }
              />
            </div>

            {/* Genres */}
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                Genres
              </h2>
              <div className="flex flex-wrap gap-2">
                {novel.genres && novel.genres.length > 0 ? (
                  novel.genres.map((genre, index) => (
                    <Badge
                      key={index}
                      className="cursor-pointer transition-transform hover:scale-105 hover:bg-green-600 hover:text-white"
                    >
                      {capitalizeFirstLetter(genre)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    No genres available
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Tags
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTagModalOpen(true)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Manage Tags
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {novel.tags && novel.tags.length > 0 ? (
                  novel.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      className="cursor-pointer transition-all hover:scale-105 hover:bg-green-600 hover:text-white"
                    >
                      {capitalizeFirstLetter(tag)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-500 italic">
                    No tags added yet
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="flex justify-between items-end max-w-[1080px] mt-16">
          <div className="text-3xl font-bold text-[1.24rem]">Reviews</div>
          <Button
            className="relative w-full max-w-40 flex"
            onClick={() => setIsReviewDialogOpen(true)}
          >
            <SquarePen className="mr-2" size={20} />
            {userReview ? "Edit Review" : "Write a Review"}
          </Button>
        </div>

        {/* Reviews */}
        <div>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onLike={handleLike}
              onComment={handleComment}
              onCommentLike={handleCommentLike}
              showEditButton={review.user_id === user?.id}
              onEdit={handleEditReview}
            />
          ))}
          {hasMore && (
            <Button onClick={() => setPage((prevPage) => prevPage + 1)}>
              Load More Reviews
            </Button>
          )}
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <NovelModal
            novel={{
              id: novel.id,
              name: novel.name,
              cover_image_url: novel.cover_image_url || "/img/novel1.jpg",
              rating: novel.rating,
              chapters_original_current: novel.chapters_original_current,
              original_language: novel.original_language,
            }}
            onClose={() => setIsModalOpen(false)}
            onUpdateComplete={() => {
              fetchUserNovelStatus();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Write a review dialog */}
      <WriteReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        novelId={parseInt(params.id)}
        onReviewCreated={handleReviewCreated}
        existingReview={userReview}
      />
      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        onAddTag={handleAddTag}
        existingTags={novel.tags || []}
      />
      {/* <TagManagement tags={novel.tags || []} onUpdateTags={handleUpdateTags} /> */}
    </div>
  );
}

function NovelSkeleton() {
  return (
    <div className="w-full max-w-[1100px] mx-auto my-0 px-9">
      <div className="flex mt-4 p-4 border shadow-lg rounded-lg">
        <div className="flex flex-col items-center mr-2 shrink-0">
          <Skeleton className="w-56 h-80 rounded-md" />
          <Skeleton className="mt-2 w-44 h-10" />
        </div>
        <div className="flex-col ml-4 space-y-4 max-w-[800px] p-4 w-full">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-16">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Add this new component for consistent detail items
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-semibold text-gray-700 dark:text-gray-300">
        {label}:
      </span>
      <span className="ml-1 text-primary hover:text-green-600 transition-colors">
        {capitalizeFirstLetter(value)}
      </span>
    </div>
  );
}
