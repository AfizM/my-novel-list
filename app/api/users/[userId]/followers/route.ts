import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const targetUserId = params.userId;

  try {
    const { data, error } = await supabase
      .from("user_relationships")
      .select(
        `
        follower:users!user_relationships_follower_id_fkey (
          user_id,
          username,
          image_url
        )
      `,
      )
      .eq("following_id", targetUserId);

    if (error) throw error;

    const followers = data.map((item) => item.follower);

    return NextResponse.json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 },
    );
  }
}
