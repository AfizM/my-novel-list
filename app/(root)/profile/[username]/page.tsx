import { notFound } from "next/navigation";
import ProfileLayout from "@/components/ProfileLayout";
import ProfileContent from "@/components/ProfileContent";
import { getUserByUsername } from "@/lib/users";

export default async function UserProfilePage({
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
      <ProfileContent user={user} />
    </ProfileLayout>
  );
}
