"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { NOVEL_GENRES } from "@/lib/constants";
import { FiltersPanel } from "@/components/FiltersPanel";
import { cn } from "@/lib/utils";

interface Novel {
  id: number;
  name: string;
  assoc_names: string[];
  original_language: string;
  authors: string[];
  genres: string[];
  tags: string[];
  cover_image_url: string;
  start_year: number;
  licensed: boolean;
  original_publisher: string;
  english_publisher: string;
  complete_original: boolean;
  chapters_original_current: string;
  complete_translated: boolean;
  chapter_latest_translated: string;
  release_freq: number;
  on_reading_lists: number;
  reading_list_all_time_rank: number;
  rating: number;
  rating_votes: number;
  recommended_series_ids: number[];
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState("popular");
  const [status, setStatus] = useState("Any");
  const [genre, setGenre] = useState("Any");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [chapterCount, setChapterCount] = useState(0);
  const [origin, setOrigin] = useState("any");

  const debouncedSearch = useDebounce(search, 300);
  const debouncedLoading = useDebounce(loading, 200);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      setOffset((prev) => prev + 20);
      setLoadingMore(true);
    }
  }, [inView, hasMore, loading, loadingMore]);

  useEffect(() => {
    setNovels([]);
    setOffset(0);
    setHasMore(true);
    fetchNovels(0);
  }, [sort, status, genre, debouncedSearch, origin, chapterCount]);

  useEffect(() => {
    if (offset > 0 && loadingMore) {
      fetchNovels(offset);
    }
  }, [offset]);

  const fetchNovels = async (currentOffset: number) => {
    if (currentOffset === 0) {
      setLoading(true);
    }
    setError(null);

    const params = new URLSearchParams({
      sort,
      status: status !== "Any" ? status : "",
      genre: genre !== "Any" ? genre : "",
      search: debouncedSearch,
      offset: currentOffset.toString(),
      limit: "20",
      origin: origin !== "any" ? origin : "",
      min_chapters: chapterCount > 0 ? chapterCount.toString() : "",
    });
    try {
      const response = await fetch(`/api/novels?${params}`);
      if (!response.ok) throw new Error("Failed to fetch novels");
      const { data, count } = await response.json();
      setNovels((prev) => (currentOffset === 0 ? data : [...prev, ...data]));
      setHasMore(currentOffset + data.length < count);
    } catch (err) {
      setError("An error occurred while fetching novels. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto my-0 px-9">
      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-4 lg:space-y-0">
            <div className="flex-col w-full lg:max-w-[300px]">
              <div className="ml-1 py-2 font-semibold">Search</div>
              <Input
                type="search"
                placeholder="Search"
                className="shadow-[0_2px_4px_0_var(--shadow-color)]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0 w-full">
              <div className="flex-col w-full md:max-w-[300px]">
                <div className="ml-1 py-2 font-semibold">Sort</div>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)]">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-col w-full lg:max-w-[300px]">
                <div className="ml-1 py-2 font-semibold">Status</div>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)]">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-col w-full lg:max-w-[300px]">
                <div className="ml-1 py-2 text-base font-semibold">Genre</div>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)]">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectItem value="Any">Any</SelectItem>
                    {NOVEL_GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-col w-full lg:w-auto lg:max-w-48 relative">
                <div className="ml-1 py-2 font-semibold lg:opacity-0">
                  Filters
                </div>
                <Button
                  variant="outline"
                  className={cn(
                    "p-2 shadow-[0_2px_4px_0_var(--shadow-color)]",
                    isFiltersOpen && "bg-accent",
                  )}
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                  <SlidersHorizontal className="h-5 w-6" />
                </Button>
                <FiltersPanel
                  isOpen={isFiltersOpen}
                  onChapterChange={(value) => setChapterCount(value[0])}
                  chapterCount={chapterCount}
                  onOriginChange={setOrigin}
                  origin={origin}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 xl:gap-[2.3rem]"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
          },
        }}
      >
        <AnimatePresence>
          {novels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </AnimatePresence>
        {(debouncedLoading || loadingMore) &&
          Array(20)
            .fill(0)
            .map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                className="flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Skeleton height={278} className="w-full rounded-md" />
                <Skeleton width={120} height={20} className="mt-2" />
              </motion.div>
            ))}
      </motion.div>
      {error && <div className="text-red-500 text-center mt-4">{error}</div>}
      {!debouncedLoading && !loadingMore && !error && hasMore && (
        <div ref={ref} className="h-10" />
      )}
      {!hasMore && (
        <div className="text-center mt-4">No more novels to load</div>
      )}
    </div>
  );
}

const NovelCard = ({ novel }: { novel: Novel }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {!imageLoaded && <Skeleton height={278} className="w-full rounded-md" />}
      <img
        src={novel.cover_image_url || "/img/novel1.jpg"}
        alt={novel.name}
        className={`w-full h-auto aspect-[185/278] object-cover rounded-md transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(true)}
      />
      <Link href={`/novel/${novel.id}`}>
        <div className="mt-2 text-sm font-medium hover:text-primary">
          {novel.name}
        </div>
      </Link>
    </motion.div>
  );
};
