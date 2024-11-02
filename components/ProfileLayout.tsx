"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUserData } from "@/contexts/UserContext";
import { useUser } from "@clerk/nextjs";
import BannerUploadModal from "@/components/BannerUploadModal";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

const navItems = [
  { name: "Overview", href: "" },
  { name: "Novel List", href: "novellist" },
  { name: "Favourites", href: "favorites" },
  { name: "Reviews", href: "reviews" },
  { name: "Social", href: "social" },
];

// Add this to track if the page has been loaded before
// const hasLoadedBefore =
//   typeof window !== "undefined"
//     ? sessionStorage.getItem("profileLoaded")
//     : null;

export default function ProfileLayout({ children, user }) {
  const pathname = usePathname();
  const { userData, updateUserData } = useUserData();
  const { user: currentUser } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [bannerKey, setBannerKey] = useState(Date.now());
  const [isFollowLoading, setIsFollowLoading] = useState(true);
  const [isFollowActionInProgress, setIsFollowActionInProgress] =
    useState(false);

  // useEffect(() => {
  //   // Check if this is the first load
  //   if (!hasLoadedBefore) {
  //     // Set the flag in sessionStorage
  //     sessionStorage.setItem("profileLoaded", "true");
  //     // Refresh the page
  //     window.location.reload();
  //   }
  // }, []);

  useEffect(() => {
    if (currentUser && user.user_id !== currentUser.id) {
      checkFollowStatus();
    }
  }, [currentUser, user]);

  useEffect(() => {
    if (user && JSON.stringify(user) !== JSON.stringify(userData)) {
      updateUserData(user);
    }
  }, [user, userData, updateUserData]);

  const checkFollowStatus = async () => {
    setIsFollowLoading(true);
    try {
      const response = await fetch(`/api/users/${user.user_id}/followers`);
      if (!response.ok) throw new Error("Failed to fetch followers");
      const followers = await response.json();
      setIsFollowing(
        followers.some((follower) => follower.user_id === currentUser.id),
      );
    } catch (error) {
      console.error("Error checking follow status:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (isFollowActionInProgress) return;

    setIsFollowActionInProgress(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/users/${user.user_id}/follow`, {
        method,
      });
      if (!response.ok) throw new Error("Failed to toggle follow status");
      setIsFollowing(!isFollowing);

      toast.success(
        isFollowing
          ? `Unfollowed ${userData.username}`
          : `Following ${userData.username}`,
      );
    } catch (error) {
      console.error("Error toggling follow status:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowActionInProgress(false);
    }
  };

  const handleBannerSuccess = (bannerUrl: string) => {
    setBannerKey(Date.now());
  };

  return (
    <div className="w-full -mt-[1.30rem] mx-auto my-0">
      <div className="relative w-full h-72">
        <img
          key={bannerKey}
          src={userData.banner_url}
          alt="Profile banner"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="flex absolute ml-40 bottom-8 space-x-4 z-10">
          <img
            src={userData.image_url}
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
            ) : currentUser ? (
              <Button
                className="min-w-24"
                onClick={handleFollowToggle}
                disabled={isFollowLoading || isFollowActionInProgress}
              >
                {isFollowLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Loading...
                  </span>
                ) : isFollowActionInProgress ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    {isFollowing ? "Unfollowing..." : "Following..."}
                  </span>
                ) : isFollowing ? (
                  "Unfollow"
                ) : (
                  "Follow"
                )}
              </Button>
            ) : null}
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
        onSuccess={handleBannerSuccess}
      />
    </div>
  );
}
