import ProfileLayout from "@/components/ProfileLayout";
import FavoritesPageContent from "@/components/FavoritesPageContent";
import { getUserByUsername } from "@/lib/users";
import { notFound } from "next/navigation";

export default async function FavoritesPage({
  params,
}: {
  params: { username: string };
}) {
  const userData = await getUserByUsername(params.username);

  if (!userData) {
    notFound();
  }

  const serializedUser = {
    user_id: userData.user_id,
    username: userData.username,
    image_url: userData.image_url || null,
    banner_url: userData.banner_url || null,
  };

  return (
    <ProfileLayout user={serializedUser}>
      <FavoritesPageContent user={userData} />
    </ProfileLayout>
  );
}
