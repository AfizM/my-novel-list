import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Textarea } from "./ui/textarea";
import { formatRelativeTime } from "@/lib/formatRelativeTime";

interface Post {
  id: string;
  content: string;
  likes: number;
  is_liked: boolean;
  created_at: string;
  users: {
    first_name: string;
    last_name: string;
    image_url: string;
  };
  post_comments: Comment[];
}

interface Comment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  likes: number;
  is_liked: boolean;
  users: {
    first_name: string;
    last_name: string;
    image_url: string;
  };
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string, isLiked: boolean, likes: number) => Promise<void>;
  onComment: (postId: string, comment: string) => Promise<void>;
  onCommentLike: (
    postId: string,
    commentId: string,
    isLiked: boolean,
    likes: number,
  ) => Promise<void>;
}

export function PostCard({
  post,
  onLike,
  onComment,
  onCommentLike,
}: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [showCommentsAndReply, setShowCommentsAndReply] = useState(false);

  const handleComment = useDebouncedCallback(async () => {
    if (comment.trim()) {
      await onComment(post.id, comment);
      setComment("");
      setIsCommenting(false);
    }
  }, 300);

  const handleLike = useDebouncedCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to like post");
      const { likes, action } = await response.json();
      onLike(post.id, action === "liked", likes);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  }, 300);

  const handleCommentLike = async (
    commentId: string,
    isLiked: boolean,
    likes: number,
  ) => {
    await onCommentLike(post.id, commentId, isLiked, likes);
  };

  const formatDate = (dateString: string) => {
    return formatRelativeTime(dateString);
  };

  return (
    <>
      <div
        className="mt-3 border rounded-md p-3 mb-3"
        style={{ fontSize: "0.9rem" }}
      >
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
            {formatDate(post.created_at)}
          </div>
        </div>
        <div className="mb-3 whitespace-pre-wrap break-words">
          {post.content}
        </div>
        <div className="flex justify-end items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className={post.is_liked ? "text-red-500" : ""}
            style={{ fontSize: "0.8rem" }}
            onClick={handleLike}
          >
            <Heart
              className="w-4 h-4 mr-1"
              fill={post.is_liked ? "currentColor" : "none"}
            />
            <span>{post.likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            style={{ fontSize: "0.8rem" }}
            onClick={() => setShowCommentsAndReply(!showCommentsAndReply)}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            <span>{post.post_comments?.length || 0}</span>
          </Button>
        </div>
      </div>

      {showCommentsAndReply && (
        <div className="mt-4 flex flex-col space-y-3">
          {post.post_comments && post.post_comments.length > 0 ? (
            post.post_comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onLike={handleCommentLike}
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

function CommentCard({
  comment,
  onLike,
}: {
  comment: Comment;
  onLike: (commentId: string, isLiked: boolean, likes: number) => Promise<void>;
}) {
  const handleLike = useDebouncedCallback(async () => {
    try {
      const response = await fetch(
        `/api/posts/${comment.post_id}/comments/${comment.id}/like`,
        {
          method: "POST",
        },
      );
      if (!response.ok) throw new Error("Failed to like comment");
      const { likes, action } = await response.json();
      await onLike(comment.id, action === "liked", likes);
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  }, 300);

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
          {formatRelativeTime(comment.created_at)}
        </div>
      </div>
      <div className="mb-1 whitespace-pre-wrap break-words">
        {comment.content}
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
