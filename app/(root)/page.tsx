"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGridIcon, SlidersHorizontal } from "lucide-react";

import Image from "next/image";
import Link from "next/link";

interface Novel {
  id: number;
  title: string;
  image: string;
  status: string;
  genre: string;
}

export default function Home() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [sort, setSort] = useState("popular");
  const [status, setStatus] = useState("Any");
  const [genre, setGenre] = useState("Any");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNovels();
  }, [sort, status, genre, search]);

  const fetchNovels = async () => {
    const params = new URLSearchParams({
      sort,
      status,
      genre,
      search,
    });
    const response = await fetch(`/api/novels?${params}`);
    const data = await response.json();
    setNovels(data);
  };

  return (
    <div className="min-h-screen">
      {/* Container */}
      <div className="w-full max-w-7xl mx-auto my-0 px-9">
        {/* Filters */}

        <div className="py-4">
          <div className="flex mb-4 space-x-6">
            <div className="flex-col w-full max-w-[300px]">
              <div className="ml-1 py-2 font-semibold">Search</div>
              <Input
                type="search"
                placeholder="Search"
                className="shadow-[0_2px_4px_0_var(--shadow-color)]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex space-x-6 w-full items-end">
              <div className="flex-col w-full  max-w-72 ">
                <div className="ml-1 py-2 font-semibold">Sort</div>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)]">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-col w-full max-w-48 ">
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

              <div className="flex-col w-full max-w-48 ">
                <div className="ml-1 py-2 text-base font-semibold">Genre</div>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="shadow-[0_2px_4px_0_var(--shadow-color)]">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    <SelectItem value="Action">Action</SelectItem>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                    <SelectItem value="Game">Game</SelectItem>
                    <SelectItem value="Mystery">Mystery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-col w-full max-w-48 ml ">
                <Button
                  variant="outline"
                  className="p-2 shadow-[0_2px_4px_0_var(--shadow-color)] ml-2 "
                >
                  <SlidersHorizontal className="h-5 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 xl:gap-[2.3rem]">
          {novels.map((novel) => (
            <div key={novel.id} className="flex flex-col">
              <img
                src={novel.image || "/img/novel1.jpg"}
                alt={novel.title}
                className="w-full h-auto aspect-[185/278] object-cover rounded-md"
              />
              <Link href={`/novel/${novel.id}`}>
                <div className="mt-2 text-sm font-medium hover:text-primary">
                  {novel.title}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
