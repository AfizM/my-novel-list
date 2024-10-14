import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

export function PostCard({ post, currentUser, onLike, onComment }) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [showComments, setShowComments] = useState(false);

  // ... existing handleComment and handleLike functions ...

  return (
    <div className="mt-4 border rounded-lg p-4 mb-4">
      {/* Main post content */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={post.users.image_url} alt="User avatar" />
            <AvatarFallback>{`${post.users.first_name[0]}${post.users.last_name[0]}`}</AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <div className="font-semibold">{`${post.users.first_name} ${post.users.last_name}`}</div>
          </div>
        </div>
        <div className="text-sm text-gray-500">{post.time_ago}</div>
      </div>
      <div className="mb-4 whitespace-pre-wrap break-words">{post.content}</div>
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
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="mr-1" />
          <span className="text-xs">{comments.length}</span>
        </Button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="mt-4 space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border rounded-lg p-3 w-11/12 mx-auto bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={comment.users.image_url}
                      alt="User avatar"
                    />
                    <AvatarFallback>{`${comment.users.first_name[0]}${comment.users.last_name[0]}`}</AvatarFallback>
                  </Avatar>
                  <div className="ml-2">
                    <div className="font-semibold text-sm">{`${comment.users.first_name} ${comment.users.last_name}`}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{comment.time_ago}</div>
              </div>
              <div className="text-sm mb-2 whitespace-pre-wrap break-words">
                {comment.comment}
              </div>
              <div className="flex justify-end items-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Heart className="w-4 h-4 mr-1" />
                  <span>{comment.likes}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      {isCommenting && (
        <div className="mt-4">
          <textarea
            className="w-full p-2 border rounded"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handleComment} className="mr-2">
              Post Comment
            </Button>
            <Button variant="outline" onClick={() => setIsCommenting(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Add comment button */}
      {!isCommenting && (
        <div className="mt-4">
          <Button
            onClick={() => setIsCommenting(true)}
            variant="outline"
            className="w-full"
          >
            Add a comment
          </Button>
        </div>
      )}
    </div>
  );
}
