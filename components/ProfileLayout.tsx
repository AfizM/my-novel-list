"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUserData } from "@/contexts/UserContext";
import { useUser } from "@clerk/nextjs";
import BannerUploadModal from "@/components/BannerUploadModal";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Overview", href: "" },
  { name: "Novel List", href: "novellist" },
  { name: "Favourites", href: "favorites" },
  { name: "Reviews", href: "reviews" },
  { name: "Social", href: "social" },
];

export default function ProfileLayout({ children, user }) {
  const pathname = usePathname();
  const { userData } = useUserData();
  const { user: currentUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (currentUser && user.user_id !== currentUser.id) {
      checkFollowStatus();
    }
  }, [currentUser, user]);

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/users/${user.user_id}/followers`);
      if (!response.ok) throw new Error("Failed to fetch followers");
      const followers = await response.json();
      setIsFollowing(
        followers.some((follower) => follower.user_id === currentUser.id),
      );
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/users/${user.user_id}/follow`, {
        method,
      });
      if (!response.ok) throw new Error("Failed to toggle follow status");
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  return (
    <div className="w-full -mt-[1.30rem] mx-auto my-0">
      <div className="relative w-full h-72">
        <img
          src={userData.banner_url}
          alt="Profile banner"
          className="w-full h-full object-cover"
          priority
          loading="eager"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="flex absolute ml-40 bottom-8 space-x-4 z-10">
          <img
            src={userData.image_url || defaultAvatarUrl}
            alt={userData.username || ""}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="flex flex-col space-y-3">
            <div className="text-white text-2xl font-semibold">
              {userData.username || "Anonymous User"}
            </div>
            {currentUser && user.user_id === currentUser.id ? (
              <Button className="min-w-24" onClick={() => setIsModalOpen(true)}>
                Edit Banner
              </Button>
            ) : (
              <Button className="min-w-24" onClick={handleFollowToggle}>
                {isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 border-b-2">
        {navItems.map((item) => {
          const href = `/profile/${userData.username}/${item.href}`;
          const isActive = pathname === href;

          return (
            <Link
              key={item.name}
              href={href}
              className={`px-4 py-4 rounded-md text-[0.92rem] font-medium transition-colors ${
                isActive ? "text-primary" : "hover:text-primary"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {children}
      <BannerUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user.id}
      />
    </div>
  );
}
