"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BannerUploadModal from "@/components/BannerUploadModal";
import { Toaster } from "sonner";

const navItems = [
  { name: "Overview", href: "" },
  { name: "Novel List", href: "novellist" },
  { name: "Favourites", href: "favourites" },
  { name: "Reviews", href: "reviews" },
  { name: "Social", href: "social" },
];

const defaultBannerUrl = "/img/default_banner.png";

export default function ProfileLayout({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any; // Replace 'any' with a proper user type
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log("USER na " + user.username);
  }, [user]);

  return (
    <div className="w-full -mt-[1.30rem] mx-auto my-0">
      <div className="relative w-full h-72">
        <img
          src={user.banner_url || defaultBannerUrl}
          alt="Profile banner"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="flex absolute ml-40 bottom-8 space-x-4 z-10">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.image_url} alt={user.username || ""} />
            <AvatarFallback>{user.username?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-3">
            <div className="text-white text-2xl font-semibold">
              {user.username || "Anonymous User"}
            </div>
            <Button className="min-w-24" onClick={() => setIsModalOpen(true)}>
              Edit Banner
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 border-b-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={`/profile/${user.username}/${item.href}`}
            className="hover:text-primary px-4 py-4 rounded-md text-[0.92rem] font-medium"
          >
            {item.name}
          </Link>
        ))}
      </div>

      {children}
      <BannerUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user.id}
      />
      <Toaster />
    </div>
  );
}
