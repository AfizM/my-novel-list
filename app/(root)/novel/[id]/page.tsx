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

  useEffect(() => {
    async function fetchNovel() {
      try {
        const fetchedNovel = await getNovel(params.id);
        setNovel(fetchedNovel);
      } catch (err) {
        setError("Failed to fetch novel");
      } finally {
        setIsLoading(false);
      }
    }
    fetchNovel();
  }, [params.id]);

  useEffect(() => {
    setReviews([]); // Clear existing reviews
    setPage(1); // Reset page to 1
    fetchReviews();
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
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoading) {
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
        <div className="flex mt-4 p-4  ">
          {/* Image */}
          <div className=" flex flex-col items-center mr-2 shrink-0  ">
            <img
              src={novel.image || "/img/novel1.jpg"}
              alt={novel.title}
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

          <div className="flex-col ml-4 space-y-3 max-w-[800px] p-2">
            {/* Title */}
            <div className="flex justify-between">
              <div className="text-[1.6rem] font-bold">{novel.title}</div>
              <div className="flex space-x-1 items-center">
                <Eye size={20} />
                <div className="text-sm font-semibold">{novel.views} Views</div>
              </div>
            </div>
            <div>
              {/* Ratings */}
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    fill={index < Math.floor(novel.ratings) ? "orange" : "gray"}
                    strokeWidth={0}
                  />
                ))}
                <div className="ml-2 font-semibold ">
                  {novel.ratings.toFixed(2)} Ratings ({novel.total_ratings})
                </div>
              </div>
            </div>
            {/* Description */}
            <div className="w-full max-w-[800px] text-[0.95rem] ">
              {novel.description}
            </div>
            <div>
              <span className="font-semibold text-sm">Author: </span>{" "}
              <span className="text-primary underline cursor-pointer text-sm">
                {novel.author}
              </span>
            </div>
            <div>
              <span className="font-semibold text-sm">Publisher:</span>{" "}
              <span className="text-primary underline cursor-pointer text-sm">
                {novel.publisher}
              </span>
            </div>

            <div>
              <span className="font-semibold text-sm">Country:</span>{" "}
              <span className="text-primary underline cursor-pointer text-sm">
                {novel.country}
              </span>
            </div>

            <div>
              <span className="font-semibold text-sm">Chapters:</span>{" "}
              <span className="text-primary cursor-pointer text-sm">
                {novel.chapters}
              </span>
            </div>

            {/* Genres */}
            <div className="flex-wrap flex   ">
              <div className="mr-2">
                <span className="font-semibold text-sm">Genres:</span>{" "}
              </div>
              <div>
                {novel.genres.map((genre, index) => (
                  <Badge className="mr-2 mb-2 cursor-pointer " key={index}>
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex-wrap flex ">
              <div className="mr-2">
                <span className="font-semibold text-sm">Tags:</span>{" "}
              </div>
              <div>
                {novel.tags.map((tag, index) => (
                  <Badge className="mr-2 mb-2 cursor-pointer " key={index}>
                    {tag}
                  </Badge>
                ))}
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
            <SquarePen className="mr-2" size={20} /> Write a Review
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
              title: novel.title,
              image: novel.image || "/img/novel1.jpg",
              score: novel.ratings,
              chapterProgress: novel.chapter_progress || 0,
              country: novel.country,
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
      />
    </div>
  );
}
