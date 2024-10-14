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
import ProfileLayout from "../profilelayout";

export default function ProfilePage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [hoveredNovelId, setHoveredNovelId] = useState(null);
  const [novels, setNovels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/novel-list");
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

  const NovelTable = ({ novels, title }) => (
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
            <TableRow key={novel.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div
                    className="relative cursor-pointer"
                    onMouseEnter={() => setHoveredNovelId(novel.id)}
                    onMouseLeave={() => setHoveredNovelId(null)}
                    onClick={() => setSelectedNovel(novel)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={novel.image} alt={novel.title} />
                      <AvatarFallback>
                        {novel.title.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {hoveredNovelId === novel.id && (
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
                <span className="text-sm text-gray-500">
                  {novel.chapter_progress}
                </span>
              </TableCell>
              <TableCell>{novel.country}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ProfileLayout>
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
                <NovelTable novels={filteredNovels.reading} title="Reading" />
                <NovelTable novels={filteredNovels.planning} title="Planning" />
                <NovelTable
                  novels={filteredNovels.completed}
                  title="Completed"
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
              />
            )}

            <Dialog
              open={selectedNovel !== null}
              onOpenChange={() => setSelectedNovel(null)}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedNovel?.title}</DialogTitle>
                </DialogHeader>
                <NovelModal
                  novel={selectedNovel}
                  onClose={() => {
                    setSelectedNovel(null);
                    setHoveredNovelId(null);
                    fetchNovels();
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}
