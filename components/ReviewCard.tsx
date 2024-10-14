import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Flag, MessageCircle, Star } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

export function ReviewCard({ review, currentUser, onLike, onComment }) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likes);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  useEffect(() => {
    // Check if the current user has liked this review
    const checkLikeStatus = async () => {
      const response = await fetch(`/api/reviews/${review.id}/like/check`, {
        method: "GET",
      });
      if (response.ok) {
        const { isLiked } = await response.json();
        setIsLiked(isLiked);
      }
    };
    checkLikeStatus();
  }, [review.id, currentUser]);

  const handleComment = async () => {
    try {
      const response = await fetch("/api/reviews/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          review_id: review.id,
          comment: comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const data = await response.json();
      onComment(review.id, data);
      setComment("");
      setIsCommenting(false);
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleLike = useDebouncedCallback(async () => {
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    // Optimistically update the UI
    setIsLiked(!isLiked);
    setLikeCount((prevCount) => (isLiked ? prevCount - 1 : prevCount + 1));

    try {
      const response = await fetch(`/api/reviews/${review.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to like review");
      }

      const data = await response.json();
      // Update with the actual data from the server
      setLikeCount(data.likes);
      setIsLiked(data.action === "liked");
      onLike(review.id, data.likes);
    } catch (error) {
      console.error("Error liking review:", error);
      // Revert the optimistic update if there's an error
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
    } finally {
      setIsLikeLoading(false);
    }
  }, 300); // 300ms debounce

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className="w-4 h-4 text-[var(--orange-rating)] fill-[var(--orange-rating)]"
          />,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="relative inline-block">
            <Star className="w-4 h-4 text-[var(--orange-rating)]" />
            <Star
              className="absolute top-0 left-0 w-4 h-4text-[var(--orange-rating)] fill-[var(--orange-rating)]"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          </span>,
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return stars;
  };

  return (
    <div className="mt-4 border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={review.users.image_url} alt="User avatar" />
            <AvatarFallback>{`${review.users.first_name[0]}${review.users.last_name[0]}`}</AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <div className="font-semibold">{`${review.users.first_name} ${review.users.last_name}`}</div>
            <div className="flex items-center mt-1">
              {renderStars(review.rating)}
              <span className="ml-1 text-sm text-gray-600">
                {review.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Chapter: {review.chapter_status}
        </div>
      </div>
      <div className="mb-4 whitespace-pre-wrap break-words">
        {review.review_description}
      </div>
      <div className="flex justify-end items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`${isLiked ? "text-red-500" : ""} ${
            isLikeLoading ? "pointer-events-none" : ""
          }`}
          disabled={isLikeLoading}
        >
          <Heart className="mr-1" fill={isLiked ? "currentColor" : "none"} />
          <span className="text-xs">{likeCount}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCommenting(!isCommenting)}
        >
          <MessageCircle className="mr-1" />
          <span className="text-xs">{review.review_comments.length}</span>
        </Button>
        {/* <Button variant="ghost" size="sm">
          <Flag className="mr-1" /> Report
        </Button> */}
      </div>
      {isCommenting && (
        <div className="mt-2">
          <textarea
            className="w-full p-2 border rounded"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <Button onClick={handleComment}>Post Comment</Button>
        </div>
      )}
      {review.review_comments.map((comment) => (
        <div key={comment.id} className="mt-2 border-t pt-2">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src={comment.users.image_url} alt="User avatar" />
              <AvatarFallback>{`${comment.users.first_name[0]}${comment.users.last_name[0]}`}</AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <div className="font-semibold">{`${comment.users.first_name} ${comment.users.last_name}`}</div>
              <div className="text-sm">{comment.comment}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
