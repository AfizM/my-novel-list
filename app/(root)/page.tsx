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
import { MultiSelect } from "@/components/ui/MultiSelect";

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

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export default function Home() {
  const [activeTab, setActiveTab] = useState<"following" | "global">(
    "following",
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<{
    data: Post[];
    timestamp: number;
  } | null>(null);

  const debouncedLoading = useDebounce(isLoading, 200);

  const fetchPosts = useCallback(async () => {
    if (cache && Date.now() - cache.timestamp < CACHE_TIME) {
      setPosts(cache.data);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
      setCache({ data, timestamp: Date.now() });
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [cache]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
            ? { ...post, post_comments: [...post.post_comments, newComment] }
            : post,
        ),
      );
    } catch (error) {
      console.error("Error adding comment:", error);
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

  // Add this function
  const handleTabChange = (value: string) => {
    if (value === "following" || value === "global") {
      setActiveTab(value);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-7xl mx-auto my-0 px-9 flex justify-center">
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-6 mt-8">
            <h2 className="text-2xl font-bold">Activity</h2>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
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
              <Button onClick={fetchPosts} className="ml-2">
                Retry
              </Button>
            </div>
          )}

          {debouncedLoading
            ? Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="mb-4">
                    <Skeleton height={100} className="mb-2" />
                    <Skeleton count={3} />
                  </div>
                ))
            : posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onCommentLike={handleCommentLike}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
