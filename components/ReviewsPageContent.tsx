// @ts-nocheck
"use client";
import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { ReviewCard } from "@/components/ReviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  novel_id: number;
  rating: number;
  review_description: string;
  likes: number;
  is_liked: boolean;
  created_at: string;
  novel: {
    id: number;
    name: string;
    cover_image_url: string;
  };
}

interface ReviewsPageContentProps {
  user: {
    user_id: string;
    username: string;
  };
}

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export default function ReviewsPageContent({ user }: ReviewsPageContentProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("recent");
  const { ref, inView } = useInView();
  const [cache, setCache] = useState<{
    [key: string]: { data: Review[]; timestamp: number };
  }>({});

  const debouncedLoading = useDebounce(loading, 200);

  const getCacheKey = useCallback(
    (pageNum: number) => {
      return `${user.username}-${sort}-${pageNum}`;
    },
    [user.username, sort],
  );

  const fetchReviews = useCallback(
    async (pageNum = 1) => {
      const cacheKey = getCacheKey(pageNum);
      const cachedData = cache[cacheKey];

      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TIME) {
        setReviews((prevReviews) =>
          pageNum === 1
            ? cachedData.data
            : [...prevReviews, ...cachedData.data],
        );
        setHasMore(cachedData.data.length === 10); // Assuming 10 reviews per page
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/users/${user.username}/reviews?page=${pageNum}&sort=${sort}`,
        );
        if (!response.ok) throw new Error("Failed to fetch reviews");
        const data = await response.json();
        setReviews((prevReviews) =>
          pageNum === 1 ? data.reviews : [...prevReviews, ...data.reviews],
        );
        setHasMore(data.hasMore);
        setCache((prevCache) => ({
          ...prevCache,
          [cacheKey]: { data: data.reviews, timestamp: Date.now() },
        }));
      } catch (err) {
        setError("An error occurred while fetching reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [user.username, sort, cache, getCacheKey],
  );

  useEffect(() => {
    setPage(1);
    setReviews([]);
    fetchReviews(1);
  }, [user.username, sort, fetchReviews]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, hasMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchReviews(page);
    }
  }, [page, fetchReviews]);

  const handleLike = async (
    reviewId: string,
    isLiked: boolean,
    newLikes: number,
  ) => {
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === reviewId
          ? { ...review, is_liked: isLiked, likes: newLikes }
          : review,
      ),
    );
    // Update cache
    Object.keys(cache).forEach((key) => {
      setCache((prevCache) => ({
        ...prevCache,
        [key]: {
          ...prevCache[key],
          data: prevCache[key].data.map((review) =>
            review.id === reviewId
              ? { ...review, is_liked: isLiked, likes: newLikes }
              : review,
          ),
        },
      }));
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[1.24rem] font-semibold leading-none tracking-tight mb-2">
          {user.username}&apos;s Reviews
        </h2>
        <Select value={sort} onValueChange={(value) => setSort(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="likes">Most Liked</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={{
              ...review,
              users: { username: user.username, image_url: "" },
              review_comments: [],
            }}
            onLike={handleLike}
            onComment={() => {}}
            onCommentLike={() => {}}
            showNovel={true}
          />
        ))}
        {debouncedLoading &&
          Array(1)
            .fill(0)
            .map((_, index) => (
              <div key={`skeleton-${index}`} className="space-y-3">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[400px]" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
      </div>
      {error && (
        <div className="text-red-500 text-center mt-4 p-2 bg-red-100 rounded">
          {error}
          <Button onClick={() => fetchReviews(page)} className="ml-2">
            Retry
          </Button>
        </div>
      )}
      {!debouncedLoading && !error && hasMore && (
        <div ref={ref} className="h-10" />
      )}
      {!hasMore && (
        <div className="text-center mt-4 text-gray-500">
          No more reviews to load
        </div>
      )}
    </div>
  );
}
