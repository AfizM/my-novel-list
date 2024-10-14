import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Flag, MessageCircle } from "lucide-react";

export function ReviewCard({ review, currentUser, onLike, onComment }) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likes);

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

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/reviews/${review.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to like review");
      }

      const data = await response.json();
      setLikeCount(data.likes);
      setIsLiked(data.action === "liked");
      onLike(review.id, data.likes);
    } catch (error) {
      console.error("Error liking review:", error);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex items-center mb-2">
        <Avatar>
          <AvatarImage src={review.users.image_url} alt="User avatar" />
          <AvatarFallback>{`${review.users.first_name[0]}${review.users.last_name[0]}`}</AvatarFallback>
        </Avatar>
        <div className="ml-2">
          <div className="font-semibold">{`${review.users.first_name} ${review.users.last_name}`}</div>
          <div className="text-sm text-gray-500">
            Chapter: {review.chapter_status}
          </div>
        </div>
      </div>
      <div className="mb-2">{review.review_description}</div>
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={isLiked ? "text-red-500" : ""}
        >
          <Heart className="mr-1" fill={isLiked ? "currentColor" : "none"} />{" "}
          {likeCount}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCommenting(!isCommenting)}
        >
          <MessageCircle className="mr-1" /> {review.review_comments.length}
        </Button>
        <Button variant="ghost" size="sm">
          <Flag className="mr-1" /> Report
        </Button>
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
