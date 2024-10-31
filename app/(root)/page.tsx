"use client";
import React, { useState, useEffect, useCallback } from "react";
import { PostCard } from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "sonner";

interface Post {
  id: string;
  content: string;
  likes: number;
  is_liked: boolean;
  created_at: string;
  novel_id?: number;
  novels?: {
    id: number;
    name: string;
    cover_image_url: string;
  };
  users: {
    username: string;
    image_url: string;
  };
  post_comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  likes: number;
  is_liked: boolean;
  users: {
    username: string;
    image_url: string;
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"following" | "global">(
    "following",
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const debouncedLoading = useDebounce(isLoading, 200);

  const fetchPosts = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!isLoadMore) {
        setIsLoading(true);
      }

      try {
        const response = await fetch(`/api/posts?page=${pageNum}`);
        if (!response.ok) throw new Error("Failed to fetch posts");
        const { posts: newPosts, hasMore: moreExists } = await response.json();

        if (isLoadMore) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        setHasMore(moreExists);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError("Failed to load posts. Please try again.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      setIsLoadingMore(true);
      fetchPosts(nextPage, true);
    }
  }, [page, isLoadingMore, fetchPosts]);

  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts(1, false);
  }, [activeTab, fetchPosts]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostContent }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      const newPost: Post = await response.json();
      setPosts([newPost, ...posts]);
      setNewPostContent("");
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (
    postId: string,
    isLiked: boolean,
    likes: number,
  ) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes,
              is_liked: isLiked,
            }
          : post,
      ),
    );
  };

  const handleComment = async (postId: string, comment: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) throw new Error("Failed to add comment");
      const newComment: Comment = await response.json();

      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                post_comments: Array.isArray(post.post_comments)
                  ? [...post.post_comments, newComment]
                  : [newComment],
              }
            : post,
        ),
      );
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment. Please try again.");
    }
  };

  const handleCommentLike = async (
    postId: string,
    commentId: string,
    isLiked: boolean,
    likes: number,
  ) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              post_comments: post.post_comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, likes, is_liked: isLiked }
                  : comment,
              ),
            }
          : post,
      ),
    );
  };

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-7xl mx-auto my-0 px-9 flex justify-center">
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-6 mt-8">
            <h2 className="text-2xl font-bold">Activity</h2>
            {/* @ts-ignore: Unreachable code error */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="global">Global</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex space-x-2 mb-6">
            <Input
              placeholder="Write a status..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            <Button onClick={handleCreatePost} disabled={isLoading}>
              Post
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-center mb-4 p-2 bg-red-100 rounded">
              {error}
              <Button onClick={() => fetchPosts(page)} className="ml-2">
                Retry
              </Button>
            </div>
          )}

          {debouncedLoading ? (
            Array(3)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="mb-4">
                  <Skeleton height={100} className="mb-2" />
                  <Skeleton count={3} />
                </div>
              ))
          ) : (
            <>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onCommentLike={handleCommentLike}
                />
              ))}

              {hasMore && (
                <div className="mt-6 mb-8 text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    variant="outline"
                  >
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}

              {!hasMore && posts.length > 0 && (
                <div className="text-center text-gray-500 mt-6 mb-8">
                  No more posts to load
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
