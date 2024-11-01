"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import BannerUploadModal from "@/components/BannerUploadModal";
import { Toaster } from "sonner";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface User {
  user_id: string;
  username: string;
  image_url?: string;
  banner_url?: string;
}

interface ProfileLayoutProps {
  children: React.ReactNode;
  user: User;
}

const navItems = [
  { name: "Overview", href: "" },
  { name: "Novel List", href: "novellist" },
  { name: "Favourites", href: "favorites" },
  { name: "Reviews", href: "reviews" },
  { name: "Social", href: "social" },
];

const defaultBannerUrl = "/img/default_banner.png";
const defaultAvatarUrl = "/img/default-avatar.png";

export default function ProfileLayout({ children, user }: ProfileLayoutProps) {
  const { user: currentUser } = useUser();
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: followStatus, refetch: refetchFollowStatus } = useQuery({
    queryKey: ["followStatus", user.user_id],
    queryFn: async () => {
      if (!currentUser || user.user_id === currentUser.id) return null;
      const response = await fetch(`/api/users/${user.user_id}/followers`);
      if (!response.ok) throw new Error("Failed to fetch followers");
      const followers = await response.json();
      return followers.some((follower) => follower.user_id === currentUser.id);
    },
    enabled: !!currentUser && user.user_id !== currentUser.id,
  });

  const handleFollowToggle = async () => {
    try {
      const method = followStatus ? "DELETE" : "POST";
      const response = await fetch(`/api/users/${user.user_id}/follow`, {
        method,
      });
      if (!response.ok) throw new Error("Failed to toggle follow status");
      refetchFollowStatus();
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  return (
    <div className="w-full -mt-[1.30rem] mx-auto my-0">
      <div className="relative w-full h-72">
        <img
          src={user?.banner_url || defaultBannerUrl}
          alt="Profile banner"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="flex absolute ml-40 bottom-8 space-x-4 z-10">
          <div className="relative w-24 h-24">
            <img
              src={user?.image_url || defaultAvatarUrl}
              alt={user.username || ""}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col space-y-3">
            <div className="text-white text-2xl font-semibold">
              {user.username || "Anonymous User"}
            </div>
            {currentUser && user.user_id === currentUser.id ? (
              <Button className="min-w-24" onClick={() => setIsModalOpen(true)}>
                Edit Banner
              </Button>
            ) : (
              <Button className="min-w-24" onClick={handleFollowToggle}>
                {followStatus ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 border-b-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={`/profile/${user.username}/${item.href}`}
            className={`hover:text-primary px-4 py-4 rounded-md text-[0.92rem] font-medium ${
              pathname === `/profile/${user.username}/${item.href}`
                ? "text-primary"
                : ""
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {children}
      <BannerUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newBannerUrl) => {
          window.location.reload();
        }}
      />
      <Toaster />
    </div>
  );
}
