"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import BannerUploadModal from "@/components/BannerUploadModal";
import { Toaster } from "sonner";

const navItems = [
  { name: "Overview", href: "/profile" },
  { name: "Novel List", href: "/novellist" },
  { name: "Favourites", href: "/" },
  { name: "Reviews", href: "/" },
  { name: "Social", href: "/" },
];

const defaultBannerUrl = "/img/default_banner.png";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBannerUrl() {
      if (user?.id) {
        try {
          const response = await fetch(`/api/users/${user.id}/banner`);
          if (response.ok) {
            const data = await response.json();
            setBannerUrl(data.bannerUrl);
          } else {
            console.error("Failed to fetch banner URL");
          }
        } catch (error) {
          console.error("Error fetching banner URL:", error);
        }
      }
    }

    fetchBannerUrl();
  }, [user]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full -mt-[1.30rem] mx-auto my-0">
      <div className="relative w-full h-72">
        <img
          src={bannerUrl || defaultBannerUrl}
          alt="Profile banner"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />{" "}
        {/* Overlay for better text visibility */}
        <div className="flex absolute ml-40 bottom-8 space-x-4 z-10">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user?.imageUrl} alt={user?.username || ""} />
            <AvatarFallback>{user?.username?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-3">
            <div className="text-white text-2xl font-semibold">
              {user?.firstName || "Anonymous User"}
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
            href={item.href}
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
      />
      <Toaster />
    </div>
  );
}
