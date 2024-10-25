// @ts-nocheck
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Star, Edit } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Textarea } from "./ui/textarea";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  review_description: string;
  likes: number;
  is_liked: boolean;
  created_at: string;
  chapter_status: number;
  users: {
    username: string;
    image_url: string;
  };
  review_comments: ReviewComment[];
}

interface ReviewComment {
  id: string;
  comment: string;
  created_at: string;
  likes: number;
  is_liked: boolean;
  users: {
    username: string;
    image_url: string;
  };
}

interface ReviewCardProps {
  review: Review;
  onLike: (reviewId: string, isLiked: boolean, likes: number) => Promise<void>;
  onComment: (reviewId: string, comment: string) => Promise<void>;
  onCommentLike: (
    reviewId: string,
    commentId: string,
    isLiked: boolean,
    likes: number
  ) => Promise<void>;
  showNovel?: boolean;
  showEditButton?: boolean;
  onEdit?: () => void;
}

export function ReviewCard({
  review,
  onLike,
  onComment,
  onCommentLike,
  showNovel,
  showEditButton,
  onEdit,
}: ReviewCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [showCommentsAndReply, setShowCommentsAndReply] = useState(false);

  const formattedTime = formatRelativeTime(review.created_at);

  const handleComment = useDebouncedCallback(async () => {
    if (comment.trim()) {
      await onComment(review.id, comment);
      setComment("");
      setIsCommenting(false);
    }
  }, 300);

  const handleLike = useDebouncedCallback(async () => {
    try {
      const response = await fetch(`/api/reviews/${review.id}/like`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to like review");
      const { likes, action } = await response.json();
      onLike(review.id, action === "liked", likes);
    } catch (error) {
      console.error("Error liking review:", error);
    }
  }, 300);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 text-[var(--orange-rating)] fill-[var(--orange-rating)]"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="relative inline-block">
            <Star className="w-4 h-4 text-[var(--orange-rating)]" />
            <Star
              className="absolute top-0 left-0 w-4 h-4 text-[var(--orange-rating)] fill-[var(--orange-rating)]"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          </span>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return stars;
  };

  return (
    <>
      {/* {showNovel && review.novels && (
        <div className="flex items-center space-x-3 mb-2">
          <img
            src={review.novels.image || "/img/novel-placeholder.jpg"}
            alt={review.novels.title}
            className="w-12 h-18 object-cover rounded"
          />
          <div>
            <Link
              href={`/novel/${review.novels.id}`}
              className="font-semibold hover:underline"
            >
              {review.novels.title}
            </Link>
          </div>
        </div>
      )} */}
      <div className="mt-4 border shadow-md rounded-lg p-4 mb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={review.users?.image_url || ""}
                alt="User avatar"
              />
              <AvatarFallback>
                {review.users?.username?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <Link
                href={`/profile/${review.users?.username || "#"}`}
                className="font-semibold hover:underline text-primary"
              >
                {review.users?.username || "Unknown User"}
              </Link>
              <div className="flex items-center mt-1">
                {renderStars(review.rating)}
                <span className="ml-1 text-sm text-gray-600">
                  {review.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {/* Chapter: {review.chapter_status} */}

            <span>{formattedTime}</span>
            {showNovel && review.novels && (
              <div>
                <Link
                  href={`/novel/${review.novels.id}`}
                  className="font-semibold hover:underline text-primary"
                >
                  {review.novels.name}
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4 whitespace-pre-wrap break-words">
          {review.review_description}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span></span>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={review.is_liked ? "text-red-500" : ""}
              onClick={handleLike}
            >
              <Heart
                className="w-4 h-4 mr-1"
                fill={review.is_liked ? "currentColor" : "none"}
              />
              <span>{review.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentsAndReply(!showCommentsAndReply)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span>{review.review_comments.length}</span>
            </Button>
            {/* {showEditButton && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )} */}
          </div>
        </div>
      </div>

      {showCommentsAndReply && (
        <div className="mt-4 flex flex-col space-y-3">
          {review.review_comments && review.review_comments.length > 0 ? (
            review.review_comments.map((comment) => (
              <ReviewCommentCard
                key={comment.id}
                comment={comment}
                onLike={(commentId, isLiked, likes) =>
                  onCommentLike(review.id, commentId, isLiked, likes)
                }
              />
            ))
          ) : (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          )}
          <CommentInput
            comment={comment}
            setComment={setComment}
            handleComment={handleComment}
          />
        </div>
      )}
    </>
  );
}

function ReviewCommentCard({
  comment,
  onLike,
}: {
  comment: ReviewComment;
  onLike: (commentId: string, isLiked: boolean, likes: number) => Promise<void>;
}) {
  const handleLike = useDebouncedCallback(async () => {
    try {
      const response = await fetch(`/api/reviews/comments/${comment.id}/like`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to like comment");
      const { likes, action } = await response.json();
      await onLike(comment.id, action === "liked", likes);
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  }, 300);

  const formattedCommentTime = formatRelativeTime(comment.created_at);

  return (
    <div
      className="border shadow-md rounded-lg p-2 w-11/12 mx-auto"
      style={{ fontSize: "0.85rem" }}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center">
          <Avatar className="w-7 h-7">
            <AvatarImage
              src={comment.users?.image_url || ""}
              alt="User avatar"
            />
            <AvatarFallback>
              {comment.users?.username?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <Link
              href={`/profile/${comment.users?.username || "#"}`}
              className="font-semibold hover:underline text-primary"
            >
              {comment.users?.username || "Unknown User"}
            </Link>
          </div>
        </div>
        <div className="text-gray-500" style={{ fontSize: "0.75rem" }}>
          {formattedCommentTime}
        </div>
      </div>
      <div className="mb-1 whitespace-pre-wrap break-words">
        {comment.comment}
        <div className="flex justify-end items-center">
          <Button
            variant="ghost"
            size="sm"
            className={comment.is_liked ? "text-red-500" : ""}
            style={{ fontSize: "0.8rem" }}
            onClick={handleLike}
          >
            <Heart
              className="w-4 h-4 mr-1"
              fill={comment.is_liked ? "currentColor" : "none"}
            />
            <span>{comment.likes}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommentInput({
  comment,
  setComment,
  handleComment,
}: {
  comment: string;
  setComment: (comment: string) => void;
  handleComment: () => void;
}) {
  return (
    <div className="w-11/12 mx-auto rounded" style={{ fontSize: "0.85rem" }}>
      <Textarea
        className="w-full p-2 border rounded min-h-[36px]"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a reply..."
        rows={2}
      />
      <div className="flex justify-end mt-2">
        <Button
          size="sm"
          onClick={handleComment}
          className="mr-2"
          style={{ fontSize: "0.8rem" }}
        >
          Post
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setComment("")}
          style={{ fontSize: "0.8rem" }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
