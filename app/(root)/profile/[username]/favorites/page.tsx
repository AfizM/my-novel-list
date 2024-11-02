import ProfileLayout from "@/components/ProfileLayout";
import FavoritesPageContent from "@/components/FavoritesPageContent";
import { getUserByUsername } from "@/lib/users";
import { notFound } from "next/navigation";
import ProfileWrapper from "@/components/ProfileWrapper";

export default async function FavoritesPage({
  params,
}: {
  params: { username: string };
}) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

  return <FavoritesPageContent user={user} />;
}
