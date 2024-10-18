"use client";
import React, { useState, useEffect } from "react";
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
// import ProfileLayout from "../profilelayout";

interface NovelListLayoutProps {
  user: any; // Replace 'any' with a proper user type
}

const NovelItem = ({ novel, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <div
            className="relative cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onSelect(novel)}
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={novel.image} alt={novel.title} />
              <AvatarFallback>{novel.title.substring(0, 2)}</AvatarFallback>
            </Avatar>
            {isHovered && (
              <div className="absolute inset-0 bg-gray-500 rounded-full flex items-center justify-center">
                <MoreHorizontal className="text-white" size={16} />
              </div>
            )}
          </div>
          <span>{novel.title}</span>
        </div>
      </TableCell>
      <TableCell>{novel.rating}</TableCell>
      <TableCell>
        <span className="text-sm text-gray-500">{novel.chapter_progress}</span>
      </TableCell>
      <TableCell>{novel.country}</TableCell>
    </TableRow>
  );
};

export default function NovelListLayout({ user }: NovelListLayoutProps) {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNovels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/users/${user.user_id}/novel-list`);
      if (!response.ok) {
        throw new Error("Failed to fetch novels");
      }
      const data = await response.json();
      setNovels(data);
    } catch (error) {
      console.error("Error fetching novels:", error);
      setError("Failed to load novels. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("fetching novels");
    fetchNovels();
  }, []);

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

  const NovelTable = ({ novels, title, onSelectNovel }) => (
    <>
      <h2 className="text-[1.24rem] font-semibold mb-4 mt-8">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Chapters</TableHead>
            <TableHead>Country</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {novels.map((novel) => (
            <NovelItem key={novel.id} novel={novel} onSelect={onSelectNovel} />
          ))}
        </TableBody>
      </Table>
    </>
  );

  const refetchUserStats = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/stats`);
      if (!response.ok) throw new Error("Failed to fetch user stats");
      const data = await response.json();
      // You might need to pass this data up to the parent component or use a global state management solution
    } catch (error) {
      console.error("Error refetching user stats:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Filters */}
        <div className="w-full md:w-[18%]">
          <h2 className="text-[1.24rem] font-semibold mb-4">Filters</h2>
          <div className="space-y-4">
            <Input type="search" placeholder="Search novels..." />
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
        <div className="w-full md:w-3/4 flex flex-col">
          {selectedFilter === "All" ? (
            <>
              <NovelTable
                novels={filteredNovels.reading}
                title="Reading"
                onSelectNovel={setSelectedNovel}
              />
              <NovelTable
                novels={filteredNovels.planning}
                title="Planning"
                onSelectNovel={setSelectedNovel}
              />
              <NovelTable
                novels={filteredNovels.completed}
                title="Completed"
                onSelectNovel={setSelectedNovel}
              />
            </>
          ) : (
            <NovelTable
              novels={
                filteredNovels[
                  selectedFilter.toLowerCase() as keyof typeof filteredNovels
                ]
              }
              title={selectedFilter}
              onSelectNovel={setSelectedNovel}
            />
          )}

          <Dialog
            open={selectedNovel !== null}
            onOpenChange={() => setSelectedNovel(null)}
          >
            <DialogContent>
              <NovelModal
                novel={selectedNovel}
                onClose={() => {
                  setSelectedNovel(null);
                }}
                onUpdateStats={() => {
                  // You can add any additional logic here if needed
                  console.log("User stats updated");
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
