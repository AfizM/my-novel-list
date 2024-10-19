import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId: currentUserId } = auth();
  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetUserId = params.userId;

  try {
    const { data, error } = await supabase
      .from("user_relationships")
      .select(
        `
        following:users!user_relationships_following_id_fkey (
          user_id,
          username,
          image_url
        )
      `,
      )
      .eq("follower_id", targetUserId);

    if (error) throw error;

    const following = data.map((item) => item.following);

    return NextResponse.json(following);
  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json(
      { error: "Failed to fetch following" },
      { status: 500 },
    );
  }
}
