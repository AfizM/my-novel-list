"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NovelModal } from "@/components/novelmodal";
import { MoreHorizontal } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { NovelListSkeleton } from "@/components/NovelListSkeleton";
import { useDebounce } from "@/hooks/useDebounce";

interface NovelListLayoutProps {
  user: any; // Replace 'any' with a proper user type
}

const CACHE_TIME = 60000; // 1 minute cache

const NovelItem = ({ novel, onSelect, isCurrentUser }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TableRow
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TableCell className="w-[560px]">
        <div className="grid grid-cols-[auto,1fr] gap-3 items-center">
          <div
            className="relative cursor-pointer"
            onClick={() => isCurrentUser && onSelect(novel)}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={novel.cover_image_url} alt={novel.name} />
              <AvatarFallback>{novel.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            {isHovered && (
              <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-full flex items-center justify-center">
                <MoreHorizontal className="text-white" size={16} />
              </div>
            )}
          </div>
          <span>{novel.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">{novel.rating}</TableCell>
      <TableCell className="text-center">
        <span className="text-sm">{novel.chapter_progress}</span>
      </TableCell>
      <TableCell className="text-center">
        {novel.original_language.charAt(0).toUpperCase() +
          novel.original_language.slice(1)}
      </TableCell>
    </TableRow>
  );
};

const NovelTable = ({ novels, title, onSelectNovel, isCurrentUser }) => {
  if (novels.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="text-[1.24rem] font-semibold mb-4">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-[4.2rem]">Title</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Chapters</TableHead>
            <TableHead>Country</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {novels.map((novel) => (
            <NovelItem
              key={novel.id}
              novel={novel}
              onSelect={onSelectNovel}
              isCurrentUser={isCurrentUser}
            />
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default function NovelListLayout({ user }: NovelListLayoutProps) {
  const { user: currentUser } = useUser();
  const isCurrentUser = user.user_id === currentUser?.id;

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const debouncedLoading = useDebounce(isLoading, 200);

  const fetchNovels = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchTime < CACHE_TIME) {
      return; // Use cached data
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${user.user_id}/novel-list`);
      if (!response.ok) {
        throw new Error("Failed to fetch novels");
      }
      const data = await response.json();
      setNovels(data);
      setLastFetchTime(now);
    } catch (error) {
      console.error("Error fetching novels:", error);
      setError("Failed to load novels. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user.user_id, lastFetchTime]);

  useEffect(() => {
    fetchNovels();
  }, [fetchNovels]);

  const filteredNovels =
    selectedFilter === "All"
      ? {
          reading: novels.filter((novel) => novel.status === "reading"),
          planning: novels.filter((novel) => novel.status === "planning"),
          completed: novels.filter((novel) => novel.status === "completed"),
        }
      : {
          [selectedFilter.toLowerCase()]: novels.filter(
            (novel) => novel.status === selectedFilter.toLowerCase(),
          ),
        };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Filters */}
        <div className="w-full md:w-[18%]">
          <div className="space-y-4 mt-9">
            <Input type="search" placeholder="Filter novels..." />
            <div className="space-y-2">
              {["All", "Planning", "Reading", "Completed"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </Button>
              ))}
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fantasy">Fantasy</SelectItem>
                <SelectItem value="scifi">Sci-Fi</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
                <SelectItem value="action">Action</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Novel List */}
        <div className="w-full md:w-[85%] flex flex-col">
          {debouncedLoading ? (
            <NovelListSkeleton />
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              {selectedFilter === "All" ? (
                <>
                  {filteredNovels.reading.length > 0 && (
                    <NovelTable
                      novels={filteredNovels.reading}
                      title="Reading"
                      onSelectNovel={setSelectedNovel}
                      isCurrentUser={isCurrentUser}
                    />
                  )}
                  {filteredNovels.planning.length > 0 && (
                    <NovelTable
                      novels={filteredNovels.planning}
                      title="Planning"
                      onSelectNovel={setSelectedNovel}
                      isCurrentUser={isCurrentUser}
                    />
                  )}
                  {filteredNovels.completed.length > 0 && (
                    <NovelTable
                      novels={filteredNovels.completed}
                      title="Completed"
                      onSelectNovel={setSelectedNovel}
                      isCurrentUser={isCurrentUser}
                    />
                  )}
                </>
              ) : (
                filteredNovels[selectedFilter.toLowerCase()]?.length > 0 && (
                  <NovelTable
                    novels={filteredNovels[selectedFilter.toLowerCase()]}
                    title={selectedFilter}
                    onSelectNovel={setSelectedNovel}
                    isCurrentUser={isCurrentUser}
                  />
                )
              )}
            </>
          )}

          <Dialog
            open={selectedNovel !== null}
            onOpenChange={() => setSelectedNovel(null)}
          >
            <DialogContent>
              <NovelModal
                novel={selectedNovel}
                onClose={() => setSelectedNovel(null)}
                onUpdateStats={() => {
                  console.log("User stats updated");
                  fetchNovels(); // Refetch novels after updating stats
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
