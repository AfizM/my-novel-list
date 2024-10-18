import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { postId: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = params;

  try {
    const { data: post, error: fetchError } = await supabase
      .from("activity_posts")
      .select("likes, liked_by")
      .eq("id", postId)
      .single();

    if (fetchError) throw fetchError;

    let likedBy = post.liked_by || [];
    let newLikes = post.likes;
    let action: "liked" | "unliked";

    if (likedBy.includes(userId)) {
      likedBy = likedBy.filter((id: string) => id !== userId);
      newLikes -= 1;
      action = "unliked";
    } else {
      likedBy.push(userId);
      newLikes += 1;
      action = "liked";
    }

    const { error: updateError } = await supabase
      .from("activity_posts")
      .update({ likes: newLikes, liked_by: likedBy })
      .eq("id", postId);

    if (updateError) throw updateError;

    return NextResponse.json({ likes: newLikes, action });
  } catch (error) {
    console.error("Error updating activity post like:", error);
    return NextResponse.json(
      { error: "Failed to update activity post like" },
      { status: 500 },
    );
  }
}
