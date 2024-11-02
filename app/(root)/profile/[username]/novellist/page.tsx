import ProfileLayout from "@/components/ProfileLayout";
import NovelListLayout from "@/components/NovelListLayout";
import { getUserByUsername } from "@/lib/users";
import { notFound } from "next/navigation";
import ProfileWrapper from "@/components/ProfileWrapper";

export default async function UserNovelListPage({
  params,
}: {
  params: { username: string };
}) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

  return <NovelListLayout user={user} />;
}
