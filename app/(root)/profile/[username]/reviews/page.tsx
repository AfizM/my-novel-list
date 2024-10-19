import ProfileLayout from "@/components/ProfileLayout";
import ReviewsPageContent from "@/components/ReviewsPageContent";
import { getUserByUsername } from "@/lib/users";
import { notFound } from "next/navigation";

export default async function ReviewsPage({
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
      <ReviewsPageContent user={user} />
    </ProfileLayout>
  );
}
