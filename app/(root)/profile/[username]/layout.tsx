import { getUserByUsername } from "@/lib/users";
import { UserProvider } from "@/contexts/UserContext";
import ProfileLayout from "@/components/ProfileLayout";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  other: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
};

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
