"use client";

import React, { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ActivityPostCard } from "@/components/ActivityPostCard";

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
  content: string;
  created_at: string;
  users: {
    first_name: string;
    last_name: string;
    image_url: string;
  };
}

interface ActivityPost {
  id: string;
  content: string;
  likes: number;
  is_liked: boolean;
  created_at: string;
  novels: {
    id: number;
    title: string;
    image: string;
  };
  activity_post_comments: ActivityPostComment[];
}

interface ActivityPostComment {
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
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"following" | "global">(
    "following",
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [activityPosts, setActivityPosts] = useState<ActivityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchActivityPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchActivityPosts = async () => {
    try {
      const response = await fetch("/api/activity-posts");
      if (!response.ok) throw new Error("Failed to fetch activity posts");
      const data = await response.json();
      setActivityPosts(data);
    } catch (error) {
      console.error("Error fetching activity posts:", error);
    }
  };

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
      setPosts([{ ...newPost, post_comments: [] }, ...posts]);
      setNewPostContent("");
    } catch (error) {
      console.error("Error creating post:", error);
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

  const handleActivityPostLike = async (
    postId: string,
    isLiked: boolean,
    likes: number,
  ) => {
    setActivityPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes,
              is_liked: isLiked,
              liked_by: isLiked
                ? [...(post.liked_by || []), userId]
                : (post.liked_by || []).filter((id) => id !== userId),
            }
          : post,
      ),
    );
  };

  const handleActivityPostComment = async (postId: string, comment: string) => {
    try {
      const response = await fetch(`/api/activity-posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) throw new Error("Failed to add comment");
      const newComment = await response.json();

      setActivityPosts(
        activityPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                activity_post_comments: [
                  ...post.activity_post_comments,
                  newComment,
                ],
              }
            : post,
        ),
      );
    } catch (error) {
      console.error("Error adding activity post comment:", error);
    }
  };

  const handleActivityPostCommentLike = async (
    postId: string,
    commentId: string,
    isLiked: boolean,
    likes: number,
  ) => {
    setActivityPosts(
      activityPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              activity_post_comments: post.activity_post_comments.map(
                (comment) =>
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
        <div className="w-full max-w-xl">
          <div className="flex justify-between items-center mb-6 mt-8">
            <h2 className="text-2xl font-bold">Activity</h2>
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

          {activityPosts.map((post) => (
            <ActivityPostCard
              key={post.id}
              post={post}
              onLike={handleActivityPostLike}
              onComment={handleActivityPostComment}
              onCommentLike={handleActivityPostCommentLike}
            />
          ))}

          {posts.map((post) => (
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
