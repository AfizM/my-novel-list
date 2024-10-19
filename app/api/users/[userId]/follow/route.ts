import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId: currentUserId } = auth();
  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetUserId = params.userId;

  if (currentUserId === targetUserId) {
    return NextResponse.json(
      { error: "Cannot follow yourself" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabase
      .from("user_relationships")
      .insert({ follower_id: currentUserId, following_id: targetUserId })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId: currentUserId } = auth();
  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetUserId = params.userId;

  try {
    const { error } = await supabase
      .from("user_relationships")
      .delete()
      .match({ follower_id: currentUserId, following_id: targetUserId });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 },
    );
  }
}
