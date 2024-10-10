import React from "react";
import { Star, ChevronDown, Heart, Flag, SquarePen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NovelPage() {
  const ratings = 3.94;
  const totalRatings = 279;
  const tags = [
    "Action",
    "Adventure",
    "Fantasy",
    "Isekai",
    "Adventure",
    "Fantasy",
    "Isekai",
    "Adventure",
    "Fantasy",
    "Isekai",
    "Adventure",
    "Fantasy",
    "Isekai",
    "Adventure",
    "Fantasy",
  ];

  return (
    <div>
      {" "}
      <div className="w-full max-w-[1100px] mx-auto my-0 px-9">
        <div className="flex mt-4 p-4  ">
          {/* Image */}
          <div className=" flex flex-col items-center mr-2 shrink-0  ">
            <img
              src="img/novel1.jpg"
              alt=""
              className="w-full max-w-56 object-cover rounded-md mt-2"
            />
            <Button className="mt-2 w-full relative max-w-52">
              Add to list
              <ChevronDown className="absolute right-2" />
            </Button>
          </div>

          <div className="flex-col ml-4 space-y-3 max-w-[800px] p-2">
            {/* Title */}
            <div className="text-[1.6rem] font-bold">
              Regressor's tale of Cultivation
            </div>
            <div>
              {/* Ratings */}
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} fill="orange" strokeWidth={0} />
                ))}
                <div className="ml-2 font-semibold ">
                  {ratings} Ratings ({totalRatings})
                </div>
              </div>
            </div>
            {/* Description */}
            <div className="w-full max-w-[800px] text-[0.95rem] ">
              On the way to a company workshop, we fell into a world of immortal
              cultivators while still in the car. Those with spiritual roots and
              unique abilities were all called to join cultivation sects, living
              prosperously. But I, having neither spiritual roots nor special
              abilities, lived as an ordinary mortal for 50 years, complying
              with fate until my death. That’s what I thought. Until I
              regressed.
            </div>
            <div>
              <span className="font-semibold text-sm">Author: </span>{" "}
              <span className="text-primary underline cursor-pointer text-sm">
                {" "}
                Tremendous
              </span>
            </div>
            <div>
              <span className="font-semibold text-sm">Publisher:</span>{" "}
              <span className="text-primary underline cursor-pointer text-sm">
                {" "}
                Munipia
              </span>
            </div>

            <div>
              <span className="font-semibold text-sm">Country:</span>{" "}
              <span className="text-primary underline cursor-pointer text-sm">
                {" "}
                South Korea
              </span>
            </div>

            <div>
              <span className="font-semibold text-sm">Chapters:</span>{" "}
              <span className="text-primary cursor-pointer text-sm"> 23</span>
            </div>

            {/* Genres */}
            <div className="flex-wrap flex  ">
              <div className="mr-2">
                <span className="font-semibold text-sm">Genres:</span>{" "}
              </div>
              {tags.map((tag, index) => (
                <Badge className="mr-2 mb-2 cursor-pointer " key={index}>
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Tags */}
            <div className="flex-wrap flex ">
              <div className="mr-2">
                <span className="font-semibold text-sm">Tags:</span>{" "}
              </div>
              {tags.map((tag, index) => (
                <Badge className="mr-2 mb-2 cursor-pointer " key={index}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-end max-w-[1080px] mt-16">
          <div className="text-3xl font-bold text-[1.24rem]">Reviews</div>
          <Button className="relative w-full max-w-40 flex ">
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
              <div>
                Status: <span className="font-semibold"> c96 </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p>
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
              <div>
                Status: <span className="font-semibold"> c96 </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p>
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
              <div>
                Status: <span className="font-semibold"> c96 </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p>
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
    </div>
  );
}
