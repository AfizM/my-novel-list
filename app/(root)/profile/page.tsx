"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ProfileLayout from "../profilelayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Star, Heart, MessageCircle, Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function ProfilePage() {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/posts`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const handleCreatePost = async () => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostContent }),
      });

      if (!response.ok) throw new Error("Failed to create post");
      const newPost = await response.json();

      setPosts([newPost, ...posts]);
      setNewPostContent("");
      setIsInputFocused(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLike = async (
    postId: string,
    isLiked: boolean,
    newLikeCount: number,
  ) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: newLikeCount,
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
      const newComment = await response.json();

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
    newLikeCount: number,
  ) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              post_comments: post.post_comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, likes: newLikeCount, is_liked: isLiked }
                  : comment,
              ),
            }
          : post,
      ),
    );
  };

  return (
    <ProfileLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 ">
          <div className="lg:col-span-2">
            {/* About me section */}
            <div className="flex flex-col space-y-2 mb-8">
              <div className=" text-[1.24rem] font-semibold leading-none tracking-tight mb-2">
                About me
              </div>
              <Card className="pt-4 ">
                <CardContent>
                  <p className="text-[0.9rem]">
                    Avid web novel reader and aspiring writer. I love exploring
                    new worlds through the pages of a good story. Always on the
                    lookout for the next epic adventure or heartwarming tale.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Novels Read
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">34</div>
                  <p className="text-xs text-muted-foreground">
                    +10 this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Rating
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">4.6</div>
                  <p className="text-xs text-muted-foreground">
                    Out of 5 stars
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Favorite Genre
                  </CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">Fantasy</div>
                  <p className="text-xs text-muted-foreground">
                    Based on ratings
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Favourite Novels section */}
            <div className="flex flex-col space-y-2 mb-8">
              <div className=" text-[1.24rem] font-semibold leading-none tracking-tight mb-2">
                Favourite Novels
              </div>
              <Card>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex flex-col items-center">
                        <Image
                          src={`/img/novel1.jpg`}
                          alt={`Favorite novel ${i}`}
                          width={100}
                          height={150}
                          className="rounded-md shadow-md"
                        />
                        <p className="mt-2 text-sm font-medium text-center">
                          Novel {i}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Activity section */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <div className="text-[1.24rem] font-semibold leading-none tracking-tight mb-2">
              Activity
            </div>
            <div className="flex flex-col space-y-4">
              <Input
                placeholder="Write a status..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
              />
              {isInputFocused && (
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsInputFocused(false);
                      setNewPostContent("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                  >
                    Post
                  </Button>
                </div>
              )}
            </div>

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
    </ProfileLayout>
  );
}
