import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { postId: string; commentId: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = params;

  try {
    const { data: comment, error: fetchError } = await supabase
      .from("activity_post_comments")
      .select("likes, liked_by")
      .eq("id", commentId)
      .single();

    if (fetchError) throw fetchError;

    let likedBy = comment.liked_by || [];
    let newLikes = comment.likes;
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
      .from("activity_post_comments")
      .update({ likes: newLikes, liked_by: likedBy })
      .eq("id", commentId);

    if (updateError) throw updateError;

    return NextResponse.json({ likes: newLikes, action });
  } catch (error) {
    console.error("Error updating activity post comment like:", error);
    return NextResponse.json(
      { error: "Failed to update activity post comment like" },
      { status: 500 },
    );
  }
}
