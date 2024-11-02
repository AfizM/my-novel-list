"use client";
import { UserProvider } from "@/contexts/UserContext";
import ProfileLayout from "./ProfileLayout";

interface User {
  user_id: string;
  username: string;
  image_url: string;
  banner_url: string;
  about_me?: string;
}

interface ProfileWrapperProps {
  user: User;
  children: React.ReactNode;
}

export default function ProfileWrapper({
  user,
  children,
}: ProfileWrapperProps) {
  return (
    <UserProvider initialUserData={user}>
      <ProfileLayout user={user}>{children}</ProfileLayout>
    </UserProvider>
  );
}
