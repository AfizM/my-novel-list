import React from "react";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";

export default function ProfilePage() {
  const userBannerUrl = "/img/default_banner.png";
  return (
    <div className="w-full -mt-[1.30rem] mx-auto my-0 ">
      <div className="relative w-full h-80 mb-6">
        <Image
          src={userBannerUrl}
          alt="Profile banner"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <Avatar className="absolute bottom-0 right-0 z-50" />
      </div>
      {/* Rest of the profile content */}
    </div>
  );
}
