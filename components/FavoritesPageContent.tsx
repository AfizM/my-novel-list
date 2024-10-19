"use client";

import { useUser } from "@clerk/nextjs";
import FavoriteNovelsList from "@/components/FavoriteNovelsList";

interface FavoritesPageContentProps {
  user: {
    user_id: string;
    username: string;
  };
}

export default function FavoritesPageContent({
  user,
}: FavoritesPageContentProps) {
  const { user: currentUser } = useUser();
  const isCurrentUser = user.user_id === currentUser?.id;

  return <FavoriteNovelsList user={user} isCurrentUser={isCurrentUser} />;
}
