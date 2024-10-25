// @ts-nocheck
"use client";
import React, { useEffect, useState, useCallback } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";

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

const CACHE_TIME = 60000; // 1 minute cache

export default function ProfileContent({ user }: ProfileContentProps) {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [aboutMe, setAboutMe] = useState(user.about_me || "");

  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user: currentUser } = useUser();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [favoriteNovels, setFavoriteNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const debouncedLoading = useDebounce(isLoading, 200);

  const fetchData = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchTime < CACHE_TIME) {
      return; // Use cached data
    }

    setIsLoading(true);
    setError(null);

    try {
      const [postsResponse, statsResponse, favoritesResponse] =
        await Promise.all([
          fetch(`/api/users/${user.username}/posts`),
          fetch(`/api/users/${user.user_id}/stats`),
          fetch(`/api/users/${user.user_id}/favorite-novels`),
        ]);

      if (!postsResponse.ok || !statsResponse.ok || !favoritesResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const [postsData, statsData, favoritesData] = await Promise.all([
        postsResponse.json(),
        statsResponse.json(),
        favoritesResponse.json(),
      ]);

      console.log("STATS DATA IS " + statsData.novelsRead);

      setPosts(postsData);
      setUserStats(statsData);
      setFavoriteNovels(favoritesData);
      setLastFetchTime(now);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load user data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user.username, user.user_id, lastFetchTime]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    newLikeCount: number
  ) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: newLikeCount,
              is_liked: isLiked,
            }
          : post
      )
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
            : post
        )
      );
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleCommentLike = async (
    postId: string,
    commentId: string,
    isLiked: boolean,
    newLikeCount: number
  ) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              post_comments: post.post_comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, likes: newLikeCount, is_liked: isLiked }
                  : comment
              ),
            }
          : post
      )
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

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

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
                {debouncedLoading ? (
                  <Skeleton className="h-[100px] w-full" />
                ) : isEditing ? (
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
          <div className="text-[1.24rem] font-semibold leading-none tracking-tight mb-4">
            Novel Stats
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Novels Read", key: "novelsRead", icon: <BookOpen /> },
              {
                label: "Chapters Read",
                key: "chaptersRead",
                icon: <Bookmark />,
              },
              {
                label: "Favorite Genre",
                key: "favoriteGenre",
                icon: <Heart />,
              },
            ].map((stat, index) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.label}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  {debouncedLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-xl font-bold">
                      {userStats && userStats[stat.key] !== undefined
                        ? userStats[stat.key]
                        : "N/A"}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Favourite Novels section */}
          <div className="flex flex-col space-y-2 mb-8">
            <div className="text-[1.24rem] font-semibold leading-none tracking-tight mb-2">
              Favourite Novels
            </div>
            <Card>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                  {debouncedLoading
                    ? Array(8)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <Skeleton className="w-24 h-36 rounded-md" />
                            <Skeleton className="w-20 h-4 mt-2" />
                          </div>
                        ))
                    : favoriteNovels.map((novel) => (
                        <div
                          key={novel.id}
                          className="flex flex-col items-center"
                        >
                          <div className="w-24 h-36 overflow-hidden rounded-md shadow-md">
                            <img
                              src={
                                novel.cover_image_url ||
                                "/img/novel-placeholder.jpg"
                              }
                              alt={novel.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="mt-2 text-sm font-medium text-center line-clamp-2">
                            {novel.name}
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

          {debouncedLoading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </Card>
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
