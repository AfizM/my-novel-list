import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { commentId: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = params;

  try {
    // Get the current comment data
    const { data: comment, error: commentError } = await supabase
      .from("review_comments")
      .select("likes, liked_by")
      .eq("id", commentId)
      .single();

    if (commentError) throw commentError;

    let likedBy = comment.liked_by || [];
    let newLikes = comment.likes;
    let action;

    if (likedBy.includes(userId)) {
      // User has already liked, so unlike
      likedBy = likedBy.filter((id) => id !== userId);
      newLikes -= 1;
      action = "unliked";
    } else {
      // User hasn't liked, so add like
      likedBy.push(userId);
      newLikes += 1;
      action = "liked";
    }

    // Update the comment with new likes count and liked_by array
    const { error: updateError } = await supabase
      .from("review_comments")
      .update({ likes: newLikes, liked_by: likedBy })
      .eq("id", commentId);

    if (updateError) throw updateError;

    return NextResponse.json({ likes: newLikes, action });
  } catch (error) {
    console.error("Error handling comment like:", error);
    return NextResponse.json(
      { error: "Failed to handle comment like" },
      { status: 500 },
    );
  }
}
