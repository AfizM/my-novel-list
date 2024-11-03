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
  BookOpenCheck,
  BookMarked,
  Sparkles,
  Trophy,
  ScrollText,
  BookText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/RichTextEditor";
import { toast } from "sonner";

interface User {
  user_id: string;
  username: string;
  image_url: string;
  banner_url: string;
  about_me?: string;
  id?: string;
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

// Add this helper function at the top of your file or in a separate utils file
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
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
  const [favoriteNovels, setFavoriteNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Add these to your existing state declarations
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [isUpdatingAboutMe, setIsUpdatingAboutMe] = useState(false);

  const debouncedLoading = useDebounce(isLoading, 200);

  const fetchData = useCallback(
    async (pageNum = 1, isLoadMore = false) => {
      if (!isLoadMore) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const [statsResponse, favoritesResponse] = await Promise.all([
          fetch(`/api/users/${user.user_id}/stats`),
          fetch(`/api/users/${user.user_id}/favorite-novels`),
        ]);

        const postsResponse = await fetch(
          `/api/users/${user.username}/posts?page=${pageNum}`,
        );

        if (!postsResponse.ok || !statsResponse.ok || !favoritesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [postsData, statsData, favoritesData] = await Promise.all([
          postsResponse.json(),
          statsResponse.json(),
          favoritesResponse.json(),
        ]);

        if (isLoadMore) {
          setPosts((prev) => [...prev, ...postsData.posts]);
        } else {
          setPosts(postsData.posts);
        }
        setHasMore(postsData.hasMore);
        setUserStats(statsData);
        setFavoriteNovels(favoritesData);
        setLastFetchTime(Date.now());
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load user data. Please try again.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [user.username, user.user_id],
  );

  // Add handleLoadMore function
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, true);
    }
  }, [page, isLoadingMore, hasMore, fetchData]);

  // Update the initial useEffect
  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchData(1, false);
  }, [fetchData]);

  const handleCreatePost = async () => {
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPostContent,
          target_user_id: user.user_id,
          hasContent: newPostContent.replace(/<[^>]*>/g, "").trim().length > 0,
        }),
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
    setIsUpdatingAboutMe(true);
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

      user.about_me = aboutMe;
      setIsEditing(false);
      toast.success("About me updated successfully");
    } catch (error) {
      console.error("Error updating about me:", error);
      toast.error("Failed to update about me");
    } finally {
      setIsUpdatingAboutMe(false);
    }
  };

  const handlePostDelete = async (postId: string) => {
    try {
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left column content */}
        <div className="lg:col-span-2">
          {/* About me section */}
          <div className="flex flex-col space-y-2 mb-8">
            <div className="text-[1.24rem] font-semibold leading-none tracking-tight mb-2">
              About me
            </div>
            <Card className="pt-4 relative">
              <CardContent>
                {debouncedLoading ? (
                  <Skeleton className="h-[100px] w-full" />
                ) : isEditing ? (
                  <div className="flex flex-col space-y-2">
                    <RichTextEditor
                      content={aboutMe}
                      onChange={setAboutMe}
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setAboutMe(user.about_me || "");
                        }}
                        variant="outline"
                        disabled={isUpdatingAboutMe}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateAboutMe}
                        disabled={isUpdatingAboutMe}
                      >
                        {isUpdatingAboutMe ? "Updating..." : "Update"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: aboutMe || "No about me information provided.",
                      }}
                    />
                    {currentUser?.username === user.username && (
                      <Button
                        className="absolute top-[-8px] right-[-8px] p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="text-[1.24rem] font-semibold leading-none tracking-tight mb-4">
            Novel Stats
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                label: "Novels Read",
                key: "novelsRead",
                icon: (
                  <BookOpenCheck className="h-5 w-5 text-green-500 dark:text-green-400" />
                ),
                bgColor: "bg-green-50 dark:bg-green-500/10",
              },
              {
                label: "Chapters Read",
                key: "chaptersRead",
                icon: (
                  <ScrollText className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                ),
                bgColor: "bg-amber-50 dark:bg-amber-500/10",
              },
              {
                label: "Favorite Genre",
                key: "favoriteGenre",
                icon: (
                  <Sparkles className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                ),
                bgColor: "bg-rose-50 dark:bg-rose-500/10",
              },
            ].map((stat, index) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.label}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.bgColor}`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  {debouncedLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-[1.34rem] font-bold">
                      {userStats && userStats[stat.key] !== undefined
                        ? stat.key === "favoriteGenre"
                          ? capitalizeFirstLetter(userStats[stat.key])
                          : userStats[stat.key]
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
          <div
            className={`text-[1.24rem] font-semibold leading-none tracking-tight ${
              currentUser ? "mb-2" : "-mb-2"
            }`}
          >
            Activity
          </div>
          <div className="flex flex-col space-y-4">
            {currentUser && (
              <div className="flex flex-col space-y-4">
                {isInputFocused ? (
                  <Card className="p-4">
                    <RichTextEditor
                      content={newPostContent}
                      onChange={setNewPostContent}
                      placeholder="Write a status..."
                    />
                    <div className="flex justify-end space-x-2 mt-4">
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
                        onClick={() => {
                          handleCreatePost();
                          setIsInputFocused(false);
                        }}
                        disabled={!newPostContent.trim()}
                      >
                        Post
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card
                    className="p-4 cursor-text hover:bg-accent/50 transition-colors"
                    onClick={() => setIsInputFocused(true)}
                  >
                    <div className="text-muted-foreground text-[0.94rem]">
                      Write a status...
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Posts display section */}
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
                  onDelete={handlePostDelete}
                  currentUserId={currentUser?.id}
                />
              ))}

          {/* Load more section */}
          {hasMore && !debouncedLoading && (
            <div className="mt-6 mb-8 text-center">
              <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center text-gray-500 mt-6 mb-8">
              No more posts to load
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
