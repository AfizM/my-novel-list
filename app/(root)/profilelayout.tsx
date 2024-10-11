"use client";

import React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const navItems = [
  { name: "Overview", href: "/profile" },
  { name: "Novel List", href: "/novellist" },
  { name: "Favourites", href: "/" },
  { name: "Reviews", href: "/" },
  { name: "Social", href: "/" },
];

const userBannerUrl = "/img/default_banner.png";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

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
            <AvatarImage src={user?.imageUrl} alt={user?.username || ""} />
            <AvatarFallback>{user?.username?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-3">
            <div className="text-white text-2xl font-semibold">
              {user?.firstName || "Anonymous User"}
            </div>
            <Button className="min-w-24">Edit</Button>
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

      {children}
    </div>
  );
}
