import ProfileLayout from "@/components/ProfileLayout";
import SocialPageContent from "@/components/SocialPageContent";
import { getUserByUsername } from "@/lib/users";
import { notFound } from "next/navigation";

export default async function UserSocialPage({
  params,
}: {
  params: { username: string };
}) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

  return (
    <ProfileLayout user={user}>
      <SocialPageContent user={user} />
    </ProfileLayout>
  );
}
