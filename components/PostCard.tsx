import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Textarea } from "./ui/textarea";

export function PostCard({ post, currentUser, onLike, onComment }) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [showCommentsAndReply, setShowCommentsAndReply] = useState(false);

  const handleComment = useDebouncedCallback(() => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now(),
        users: {
          first_name: currentUser.first_name,
          last_name: currentUser.last_name,
          image_url: currentUser.image_url,
        },
        comment: comment,
        time_ago: "Just now",
        likes: 0,
      };
      setComments([...comments, newComment]);
      onComment(post.id, comment);
      setComment("");
      setIsCommenting(false);
    }
  }, 300);

  const handleLike = useDebouncedCallback(() => {
    setIsLikeLoading(true);
    const newLikeState = !isLiked;
    setIsLiked(newLikeState);
    setLikeCount(newLikeState ? likeCount + 1 : likeCount - 1);
    onLike(post.id, newLikeState);
    setIsLikeLoading(false);
  }, 300);

  return (
    <>
      <div
        className="mt-3 border rounded-md p-3 mb-3"
        style={{ fontSize: "0.9rem" }}
      >
        {/* Main post content */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.users.image_url} alt="User avatar" />
              <AvatarFallback>{`${post.users.first_name[0]}${post.users.last_name[0]}`}</AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <div className="font-semibold">{`${post.users.first_name} ${post.users.last_name}`}</div>
            </div>
          </div>
          <div className="text-gray-500" style={{ fontSize: "0.8rem" }}>
            {post.time_ago}
          </div>
        </div>
        <div className="mb-3 whitespace-pre-wrap break-words">
          {post.content}
        </div>
        <div className="flex justify-end items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className={`${isLiked ? "text-red-500" : ""} ${
              isLikeLoading ? "pointer-events-none" : ""
            }`}
            style={{ fontSize: "0.8rem" }}
            disabled={isLikeLoading}
            onClick={handleLike}
          >
            <Heart
              className="w-4 h-4 mr-1"
              fill={isLiked ? "currentColor" : "none"}
            />
            <span>{likeCount}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ fontSize: "0.8rem" }}
            onClick={() => setShowCommentsAndReply(!showCommentsAndReply)}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            <span>{comments.length}</span>
          </Button>
        </div>
      </div>

      {showCommentsAndReply && (
        <div className="mt-4 flex flex-col space-y-3">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
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

function CommentCard({ comment }) {
  return (
    <div
      className="border rounded-md p-2 w-11/12 mx-auto"
      style={{ fontSize: "0.85rem" }}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center">
          <Avatar className="w-7 h-7">
            <AvatarImage src={comment.users.image_url} alt="User avatar" />
            <AvatarFallback>{`${comment.users.first_name[0]}${comment.users.last_name[0]}`}</AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <div className="font-semibold">{`${comment.users.first_name} ${comment.users.last_name}`}</div>
          </div>
        </div>
        <div className="text-gray-500" style={{ fontSize: "0.75rem" }}>
          {comment.time_ago}
        </div>
      </div>
      <div className="mb-1 whitespace-pre-wrap break-words">
        {comment.comment}
      </div>
      <div className="flex justify-end items-center">
        <Button variant="ghost" size="sm" style={{ fontSize: "0.8rem" }}>
          <Heart className="w-3 h-3 mr-1" />
          <span>{comment.likes}</span>
        </Button>
      </div>
    </div>
  );
}

function CommentInput({ comment, setComment, handleComment }) {
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
