import { getUserByUsername } from "@/lib/users";
import { UserProvider } from "@/contexts/UserContext";
import ProfileLayout from "@/components/ProfileLayout";
import { notFound } from "next/navigation";

export default async function ProfilePagesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { username: string };
}) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

  return (
    <UserProvider initialUserData={user}>
      <ProfileLayout user={user}>{children}</ProfileLayout>
    </UserProvider>
  );
}
