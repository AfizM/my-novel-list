import React from "react";
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
import { Progress } from "@/components/ui/progress";

const novels = [
  {
    id: 1,
    title: "The Wandering Inn",
    image: "/img/novel1.jpg",
    score: 9.5,
    chapterProgress: 80,
    country: "CN",
  },
  {
    id: 2,
    title: "Mother of Learning",
    image: "/placeholder.svg",
    score: 9.2,
    chapterProgress: 100,
    country: "KR",
  },
  {
    id: 3,
    title: "Worm",
    image: "/placeholder.svg",
    score: 8.8,
    chapterProgress: 60,
    country: "CN",
  },
  {
    id: 4,
    title: "The Legendary Moonlight Sculptor",
    image: "/placeholder.svg",
    score: 8.5,
    chapterProgress: 100,
    country: "JP",
  },
];

export default function ProfilePage() {
  const navItems = [
    { name: "Overview", href: "/profile" },
    { name: "Novel List", href: "/novellist" },
    { name: "Favourites", href: "/" },
    { name: "Reviews", href: "/" },
    { name: "Social", href: "/" },
  ];
  const userBannerUrl = "/img/default_banner.png";

  return (
    <div className="w-full -mt-[1.30rem] mx-auto my-0">
      <div className="relative w-full h-72">
        <Image
          src={userBannerUrl}
          alt="Profile banner"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="flex absolute ml-40 bottom-8 space-x-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-3">
            <div className="text-white text-2xl font-semibold">
              shadowtale123
            </div>
            <Button className="max-w-28">Edit</Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 border-b-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="hover:text-primary px-4 py-4 rounded-md text-[0.92rem] font-medium"
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Filters */}
          <div className="w-full md:w-[18%]">
            <h2 className="text-[1.24rem] font-semibold mb-4">Filters</h2>
            <div className="space-y-4">
              <Input type="search" placeholder="Search novels..." />
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  All
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Planning
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Reading
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Completed
                </Button>
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
            <h2 className="text-[1.24rem] font-semibold mb-4">Reading</h2>
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
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src="https://github.com/shadcn.png"
                            alt="@shadcn"
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <span>{novel.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{novel.score}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {novel.chapterProgress}
                      </span>
                    </TableCell>
                    <TableCell>{novel.country}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <h2 className="text-[1.24rem] font-semibold mb-4 mt-6 ">
              Planning
            </h2>
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
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src="https://github.com/shadcn.png"
                            alt="@shadcn"
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <span>{novel.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{novel.score}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {novel.chapterProgress}
                      </span>
                    </TableCell>
                    <TableCell>{novel.country}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
