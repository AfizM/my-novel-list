"use client";
import React, { useState, useEffect } from "react";
import { Star, ChevronDown, Heart, Flag, SquarePen, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notFound } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NovelModal } from "@/components/novelmodal";
import WriteReviewDialog from "@/components/write-a-review-dialog";

async function getNovel(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/novels/${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch novel");
  }
  return res.json();
}

export default function NovelPage({ params }: { params: { id: string } }) {
  const [novel, setNovel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchNovel() {
      try {
        const fetchedNovel = await getNovel(params.id);
        setNovel(fetchedNovel);
      } catch (err) {
        setError("Failed to fetch novel");
      } finally {
        setIsLoading(false);
      }
    }
    fetchNovel();
  }, [params.id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!novel) {
    notFound();
  }

  return (
    <div>
      <div className="w-full max-w-[1100px] mx-auto my-0 px-9">
        <div className="flex mt-4 p-4  ">
          {/* Image */}
          <div className=" flex flex-col items-center mr-2 shrink-0  ">
            <img
              src={novel.image || "/img/novel1.jpg"}
              alt={novel.title}
              className="w-full max-w-56 object-cover rounded-md mt-2"
            />
            <Button
              className="mt-2 w-full relative max-w-44"
              onClick={() => setIsModalOpen(true)}
            >
              Add to list
              <ChevronDown className="absolute right-2" />
            </Button>
          </div>

          <div className="flex-col ml-4 space-y-3 max-w-[800px] p-2">
            {/* Title */}
            <div className="flex justify-between">
              <div className="text-[1.6rem] font-bold">{novel.title}</div>
              <div className="flex space-x-1 items-center">
                <Eye size={20} />
                <div className="text-sm font-semibold">{novel.views} Views</div>
              </div>
            </div>
            <div>
              {/* Ratings */}
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    fill={index < Math.floor(novel.ratings) ? "orange" : "gray"}
                    strokeWidth={0}
                  />
                ))}
                <div className="ml-2 font-semibold ">
                  {novel.ratings.toFixed(2)} Ratings ({novel.total_ratings})
                </div>
              </div>
            </div>
            {/* Description */}
            <div className="w-full max-w-[800px] text-[0.95rem] ">
              {novel.description}
            </div>
            <div>
              <span className="font-semibold text-sm">Author: </span>{" "}
              <span className="text-primary underline cursor-pointer text-sm">
                {novel.author}
              </span>
            </div>
            <div>
              <span className="font-semibold text-sm">Publisher:</span>{" "}
              <span className="text-primary underline cursor-pointer text-sm">
                {novel.publisher}
              </span>
            </div>

            <div>
              <span className="font-semibold text-sm">Country:</span>{" "}
              <span className="text-primary underline cursor-pointer text-sm">
                {novel.country}
              </span>
            </div>

            <div>
              <span className="font-semibold text-sm">Chapters:</span>{" "}
              <span className="text-primary cursor-pointer text-sm">
                {novel.chapters}
              </span>
            </div>

            {/* Genres */}
            <div className="flex-wrap flex   ">
              <div className="mr-2">
                <span className="font-semibold text-sm">Genres:</span>{" "}
              </div>
              <div>
                {novel.genres.map((genre, index) => (
                  <Badge className="mr-2 mb-2 cursor-pointer " key={index}>
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex-wrap flex ">
              <div className="mr-2">
                <span className="font-semibold text-sm">Tags:</span>{" "}
              </div>
              <div>
                {novel.tags.map((tag, index) => (
                  <Badge className="mr-2 mb-2 cursor-pointer " key={index}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="flex justify-between items-end max-w-[1080px] mt-16">
          <div className="text-3xl font-bold text-[1.24rem]">Reviews</div>
          <Button
            className="relative w-full max-w-40 flex"
            onClick={() => setIsReviewDialogOpen(true)}
          >
            <SquarePen className="mr-2" size={20} /> Write a Review
          </Button>
        </div>

        <Card className="mt-6 max-w-[1080px]">
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex">
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col ml-2">
                  <div className="ml-1 font-semibold ">shadowtale123</div>
                  <div className="flex ml-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        size={18}
                        key={index}
                        fill="orange"
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-[0.9rem]">
                Status: <span className="font-semibold"> c96 </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[0.94rem]">
              a great premise with poor execution first off As stated by a
              previous reviewer, his regressions are also super formulaic. He
              gets depressed, gets a eureka moment before dying, regress, gets
              hopeful and repeat. secondly, the wordcount extendinator or as the
              author would call it, calling out attack moves of a 20+ combo. And
              I mean each strike, followed by effects like boom or whoosh
              lastly, the biggest gripe I have with this is that for some
            </p>
            <div className="flex space-x-2 justify-end">
              <Heart className="cursor-pointer" size={20} />
              <Flag className="cursor-pointer" size={20} />
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{novel.title}</DialogTitle>
          </DialogHeader>
          <NovelModal
            novel={{
              id: novel.id,
              title: novel.title,
              image: novel.image || "/img/novel1.jpg",
              score: novel.ratings,
              chapterProgress: 0,
              country: novel.country,
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Write a review dialog */}
      <WriteReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
      />
    </div>
  );
}
