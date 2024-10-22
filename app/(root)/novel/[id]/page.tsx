"use client";
import React, { useState, useEffect } from "react";
import { Star, ChevronDown, Heart, Flag, SquarePen, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NovelModal } from "@/components/novelmodal";
import WriteReviewDialog from "@/components/write-a-review-dialog";
import { useUser } from "@clerk/nextjs";
import { ReviewCard } from "@/components/ReviewCard";
import { toast } from "sonner";
import { capitalizeFirstLetter } from "@/utils/capitalize";

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
}

async function getNovel(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/novels/${id}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error("Failed to fetch novel");
  }
  return res.json();
}

export default function NovelPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const [novel, setNovel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userReview, setUserReview] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedNovel = await getNovel(params.id);
        setNovel(fetchedNovel);
        await fetchUserReview();
      } catch (err) {
        setError("Failed to fetch novel");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

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
    toast.success("Review successfully created!");
    setIsReviewDialogOpen(false);
    setReviews([]);
    setPage(1);
    await fetchReviews();
    await fetchUserReview();
  };

  const handleEditReview = () => {
    setIsReviewDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!novel) {
    notFound();
  }

  return (
    <div>
      <div className="w-full max-w-[1100px] mx-auto my-0 px-9">
        <div className="flex mt-4 p-4   border shadow-lg rounded-lg ">
          {/* Image */}
          <div className=" flex flex-col items-center mr-2 shrink-0  ">
            <img
              src={novel.cover_image_url || "/img/novel1.jpg"}
              alt={novel.name || "Novel cover"}
              className="w-full max-w-56 object-cover rounded-md mt-2"
            />
            <Button
              className="mt-2 w-full relative max-w-44"
              onClick={() => setIsModalOpen(true)}
            >
              Add to list
              <ChevronDown className="absolute right-2" />
            </Button>
          </div>

          <div className="flex-col ml-4 space-y-4 max-w-[800px] p-4 ">
            {/* Title */}
            <div className="flex justify-between items-center">
              <div className="text-[1.8rem] font-bold text-gray-800 hover:text-green-600 transition-colors">
                {novel.name || "Untitled Novel"}
              </div>
              <div className="flex space-x-1 items-center">
                <Eye size={20} className="text-gray-500" />
                <div className="text-sm font-semibold text-gray-600">
                  {novel.views || 0} Views
                </div>
              </div>
            </div>

            {/* Ratings */}
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  fill={
                    index < Math.floor(novel.rating || 0) ? "orange" : "gray"
                  }
                  strokeWidth={0}
                  className="transition-transform transform hover:scale-110"
                />
              ))}
              <div className="ml-2 font-semibold text-gray-700">
                {novel.rating != null ? novel.rating.toFixed(2) : "N/A"} Ratings
                ({novel.rating_votes ?? 0})
              </div>
            </div>

            {/* Description */}
            <div className="w-full text-[0.95rem] text-gray-700">
              {novel.description || "No description available."}
            </div>

            {/* Author */}
            <div className="flex items-center">
              <span className="font-semibold text-sm">Author:</span>
              <span className="text-primary underline cursor-pointer text-sm ml-1 transition-colors hover:text-green-600">
                {novel.authors && novel.authors.length > 0
                  ? capitalizeFirstLetter(novel.authors[0])
                  : "Unknown"}
              </span>
            </div>

            {/* Original Publisher */}
            <div className="flex items-center">
              <span className="font-semibold text-sm">Original Publisher:</span>
              <span className="text-primary underline cursor-pointer text-sm ml-1 transition-colors hover:text-green-600">
                {novel.original_publisher
                  ? capitalizeFirstLetter(novel.original_publisher)
                  : "Unknown"}
              </span>
            </div>

            {/* English Publisher */}
            <div className="flex items-center">
              <span className="font-semibold text-sm">English Publisher:</span>
              <span className="text-primary underline cursor-pointer text-sm ml-1 transition-colors hover:text-green-600">
                {novel.english_publisher
                  ? capitalizeFirstLetter(novel.english_publisher)
                  : "Unknown"}
              </span>
            </div>

            {/* Original Language */}
            <div className="flex items-center">
              <span className="font-semibold text-sm">Original Language:</span>
              <span className="text-primary underline cursor-pointer text-sm ml-1 transition-colors hover:text-green-600">
                {novel.original_language
                  ? capitalizeFirstLetter(novel.original_language)
                  : "Unknown"}
              </span>
            </div>

            {/* Chapters */}
            <div className="flex items-center">
              <span className="font-semibold text-sm">Chapters:</span>
              <span className="text-primary cursor-pointer text-sm ml-1 transition-colors hover:text-green-600">
                {novel.chapters_original_current || "Unknown"}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center">
              <span className="font-semibold text-sm">Status:</span>
              <span className="text-primary cursor-pointer text-sm ml-1 transition-colors hover:text-green-600">
                {novel.complete_original != null
                  ? novel.complete_original
                    ? "Completed"
                    : "Ongoing"
                  : "Unknown"}
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-start">
                <div className="flex flex-wrap gap-2 w-full">
                  <span className="font-semibold text-sm ">Genres:</span>
                  {novel.genres && novel.genres.length > 0 ? (
                    novel.genres.map((tag, index) => (
                      <Badge
                        className="cursor-pointer transition-transform transform hover:scale-105 hover:bg-green-600 hover:text-white rounded-full px-3 py-1 border border-gray-300"
                        key={index}
                      >
                        {capitalizeFirstLetter(tag)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      No genres available
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-start mb-2">
                <div className="flex flex-wrap gap-2 w-full">
                  <span className="font-semibold text-sm ">Tags:</span>
                  {novel.tags && novel.tags.length > 0 ? (
                    novel.tags.map((tag, index) => {
                      const capitalizedTag =
                        tag.charAt(0).toUpperCase() + tag.slice(1);
                      return (
                        <Badge
                          className="cursor-pointer transition-transform transform hover:scale-105 hover:bg-green-600 hover:text-white rounded-full px-3 py-1 border border-gray-300"
                          key={index}
                        >
                          {capitalizedTag}
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-500">
                      No tags available
                    </span>
                  )}
                </div>
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
    </div>
  );
}
