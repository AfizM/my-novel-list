import ProfileLayout from "@/components/ProfileLayout";
import SocialPageContent from "@/components/SocialPageContent";
import { getUserByUsername } from "@/lib/users";
import { notFound } from "next/navigation";

export default async function UserSocialPage({
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
      <SocialPageContent user={userData} />
    </ProfileLayout>
  );
}
