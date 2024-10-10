import React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Star, Heart, MessageCircle, Flag } from "lucide-react";
import { Input } from "@/components/ui/input";

function ActivityItem({ type, content, novel, timestamp }) {
  return (
    <div className="mb-4">
      <p className="text-sm text-gray-500">{timestamp}</p>
      <p className="text-sm">
        <span className="font-semibold">shadowtale123</span>{" "}
        {type === "update" ? `updated ${novel}` : "posted"}
      </p>
      <p className="text-sm mt-1">{content}</p>
    </div>
  );
}

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 ">
          <div className="lg:col-span-2">
            {/* About me section */}
            <div className="flex flex-col space-y-2 mb-8">
              <div className=" text-[1.24rem] font-semibold leading-none tracking-tight mb-2">
                About me
              </div>
              <Card className="pt-4 ">
                <CardContent>
                  <p>
                    Avid web novel reader and aspiring writer. I love exploring
                    new worlds through the pages of a good story. Always on the
                    lookout for the next epic adventure or heartwarming tale.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">
                    +10 this month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Rating
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.6</div>
                  <p className="text-xs text-muted-foreground">
                    Out of 5 stars
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Favorite Genre
                  </CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Fantasy</div>
                  <p className="text-xs text-muted-foreground">
                    Based on ratings
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Favourite Novels section */}
            <div className="flex flex-col space-y-2 mb-8">
              <div className=" text-[1.24rem] font-semibold leading-none tracking-tight mb-2">
                Favourite Novels
              </div>
              <Card>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex flex-col items-center">
                        <Image
                          src={`/img/novel1.jpg`}
                          alt={`Favorite novel ${i}`}
                          width={100}
                          height={150}
                          className="rounded-md shadow-md"
                        />
                        <p className="mt-2 text-sm font-medium text-center">
                          Novel {i}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Activity section */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <div className=" text-[1.24rem] font-semibold leading-none tracking-tight mb-2">
              Activity
            </div>
            <Input type="search" placeholder="Write a status..." />

            {/* Post Card */}
            <Card className="mt-6 ">
              <CardContent className="pt-3 pb-3 ">
                {/* Top row */}
                <div className="flex justify-between items-center relative mb-2">
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="@shadcn"
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col ml-2 items">
                      <div className="ml-1 font-semibold text-[0.9rem] ">
                        shadowtale123
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-0 top-0">
                    <span className="font-semibold text-[0.8rem]">
                      {" "}
                      2 mins ago{" "}
                    </span>
                  </div>
                </div>

                <p className="text-[0.9rem]">
                  a great premise with poor execution first off As stated by a
                  previous reviewer, his regressions are also super formulaic.
                  He gets depressed, gets a eureka moment before dying, regress,
                  gets hopeful and repeat. secondly, the wordcount extendinator
                </p>
                <div className="flex space-x-4 justify-end mt-2">
                  <div className="flex items-center">
                    <div className="mr-1 text-[0.9rem]">2</div>
                    <MessageCircle className="cursor-pointer" size={16} />
                  </div>
                  <div className="flex items-center">
                    <div className="mr-1 text-[0.9rem]">2</div>
                    <Heart className="cursor-pointer" size={16} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className=" ">
              <CardContent className="pt-0 pb-0 pl-0 ">
                {/* Top row */}
                <div className="flex items-center space-x-6 relative">
                  <img
                    src="/img/novel1.jpg"
                    alt="Novel 1"
                    className="w-20 rounded-md "
                  />
                  <p className="text-[0.9rem] ">
                    Completed Regressors Tale of Cultivation
                  </p>
                  <div className="ml-1 font-semibold text-[0.8rem] absolute right-0 top-3 ">
                    2 mins ago
                  </div>
                  <div className="flex space-x-4 justify-end mt-2 absolute bottom-3 right-0">
                    <div className="flex items-center">
                      <div className="mr-1 text-[0.9rem]">2</div>
                      <MessageCircle className="cursor-pointer" size={16} />
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1 text-[0.9rem]">2</div>
                      <Heart className="cursor-pointer" size={16} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
