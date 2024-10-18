"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Bookmark,
  Star,
  Heart,
  MessageCircle,
  Flag,
  Edit,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  about_me: string | null;
}

interface ProfileContentProps {
  user: User;
}

interface UserStats {
  novelsRead: number;
  chaptersRead: number;
  favoriteGenre: string;
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [aboutMe, setAboutMe] = useState(user.about_me || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user: currentUser } = useUser();
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  useEffect(() => {
    console.log("USER " + user.id);
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch(`/api/users/${user.user_id}/stats`);
        if (!response.ok) throw new Error("Failed to fetch user stats");
        const data = await response.json();
        setUserStats(data);
        console.log("User stats:", userStats);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserStats();
  }, [user.id]);

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`/api/users/${user.username}/posts`);
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

  const handleUpdateAboutMe = async () => {
    try {
      const response = await fetch(`/api/users/${user.username}/about-me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ about_me: aboutMe }),
      });

      if (!response.ok) {
        throw new Error("Failed to update about me");
      }

      // Update the user object with the new about_me
      user.about_me = aboutMe;
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating about me:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 ">
        <div className="lg:col-span-2">
          {/* About me section */}
          <div className="flex flex-col space-y-2 mb-8">
            <div className="text-[1.24rem] font-semibold leading-none tracking-tight mb-2">
              About me
            </div>
            <Card
              className="pt-4 relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <CardContent>
                {isEditing ? (
                  <div className="flex flex-col space-y-2">
                    <Textarea
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setAboutMe(user.about_me || "");
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateAboutMe}>Update</Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[0.9rem] whitespace-pre-wrap break-words">
                    {aboutMe || "No about me information provided."}
                  </p>
                )}
              </CardContent>
              {currentUser?.username === user.username &&
                isHovered &&
                !isEditing && (
                  <Button
                    className="absolute top-2 right-2 p-2"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
            </Card>
          </div>
          <div className=" text-[1.24rem] font-semibold leading-none tracking-tight mb-4">
            Novel Stats
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
                <div className="text-xl font-bold">
                  {userStats?.novelsRead || "N/A"}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Chapters Read
                </CardTitle>
                <Bookmark className="h-4 w-4 text-muted-foreground text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {userStats?.chaptersRead || 0}
                </div>
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
                <div className="text-xl font-bold">
                  {userStats?.favoriteGenre || "N/A"}
                </div>
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
  );
}
