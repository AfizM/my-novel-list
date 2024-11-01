import { notFound } from "next/navigation";
import ProfileLayout from "@/components/ProfileLayout";
import ProfileContent from "@/components/ProfileContent";
import { getUserByUsername } from "@/lib/users";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const userData = await getUserByUsername(params.username);

  if (!userData) {
    notFound();
  }

  // Serialize the user data
  const serializedUser = {
    user_id: userData.user_id,
    username: userData.username,
    image_url: userData.image_url || null,
    banner_url: userData.banner_url || null,
  };

  return (
    <ProfileLayout user={serializedUser}>
      <ProfileContent user={userData} />
    </ProfileLayout>
  );
}
