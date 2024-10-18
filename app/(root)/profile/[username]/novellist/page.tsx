import ProfileLayout from "@/components/ProfileLayout";
import NovelListLayout from "@/components/NovelListLayout";
import { getUserByUsername } from "@/lib/users";
import { notFound } from "next/navigation";

export default async function UserNovelListPage({
  params,
}: {
  params: { username: string };
}) {
  const user = await getUserByUsername(params.username);
  console.log("USER " + params.username);

  if (!user) {
    notFound();
  }

  return (
    <ProfileLayout user={user}>
      <NovelListLayout user={user} />
    </ProfileLayout>
  );
}
