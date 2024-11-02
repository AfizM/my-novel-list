"use client";
import React, { useState, useEffect, useCallback } from "react";
import { PostCard } from "@/components/PostCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

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
  const { user: currentUser } = useUser();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const debouncedLoading = useDebounce(isLoading, 200);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTabSwitching, setIsTabSwitching] = useState(false);

  const fetchPosts = useCallback(
    async (pageNum: number, isLoadMore = false) => {
      if (!isLoadMore) {
        setIsInitialLoading(true);
        setIsTabSwitching(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await fetch(
          `/api/posts?page=${pageNum}&tab=${activeTab}`,
        );
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
        setIsInitialLoading(false);
        setIsLoadingMore(false);
        setIsTabSwitching(false);
      }
    },
    [activeTab],
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

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/admin/check");
        const { isAdmin } = await response.json();
        setIsAdmin(isAdmin);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, []);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostContent }),
      });

      if (!response.ok) throw new Error("Failed to create post");

      const newPost: Post = await response.json();

      // Optimistically update the UI
      setPosts((prevPosts) => [
        {
          ...newPost,
          post_comments: [], // Ensure post_comments is initialized
          users: newPost.users,
        },
        ...prevPosts,
      ]);

      setNewPostContent("");
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
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
      <div className="w-full max-w-7xl mx-auto my-0 px-4 sm:px-6 lg:px-9">
        <div className="w-full max-w-lg mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 mt-8">
            <h2 className="text-2xl font-bold">Activity</h2>
            {currentUser &&
              (isAdmin ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="w-full sm:w-auto">
                      <TabsTrigger
                        value="following"
                        className="flex-1 sm:flex-none"
                      >
                        Following
                      </TabsTrigger>
                      <TabsTrigger
                        value="global"
                        className="flex-1 sm:flex-none"
                      >
                        Global
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-sm w-full sm:w-auto"
                    onClick={() => router.push("/admin/submissions")}
                  >
                    <Badge variant="secondary" className="h-5 px-1.5">
                      Admin
                    </Badge>
                    Pending Submissions
                  </Button>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="following">Following</TabsTrigger>
                    <TabsTrigger value="global">Global</TabsTrigger>
                  </TabsList>
                </Tabs>
              ))}
          </div>

          {currentUser && (
            <Card className="mb-6">
              {isInputFocused ? (
                <div className="p-4">
                  <RichTextEditor
                    content={newPostContent}
                    onChange={setNewPostContent}
                    placeholder="Share your thoughts..."
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
                </div>
              ) : (
                <div
                  className="p-4 cursor-text hover:bg-accent/50 transition-colors flex items-center gap-3"
                  onClick={() => setIsInputFocused(true)}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={currentUser?.imageUrl}
                      alt="Your avatar"
                    />
                  </Avatar>
                  <div className="text-muted-foreground flex-1 text-[0.94rem]">
                    Share your thoughts...
                  </div>
                </div>
              )}
            </Card>
          )}

          {error && (
            <div className="text-red-500 text-center mb-4 p-2 bg-red-100 rounded">
              {error}
              <Button onClick={() => fetchPosts(page)} className="ml-2">
                Retry
              </Button>
            </div>
          )}

          {isInitialLoading ? (
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

              {!isTabSwitching && hasMore && (
                <div className="mt-6 mb-8 text-center">
                  <Button onClick={handleLoadMore} disabled={isLoadingMore}>
                    {isLoadingMore ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}

              {!isTabSwitching && !hasMore && posts.length > 0 && (
                <div className="text-center text-gray-500 mt-6 mb-8">
                  No more posts to load
                </div>
              )}

              {!isTabSwitching && posts.length === 0 && (
                <div className="text-center text-gray-500 mt-6 mb-8">
                  {activeTab === "following"
                    ? "No posts from people you follow yet. Try following more people!"
                    : "No posts found."}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
