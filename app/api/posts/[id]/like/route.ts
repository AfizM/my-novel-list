import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const postId = params.id;

  try {
    // Get the current post data
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("likes, liked_by")
      .eq("id", postId)
      .single();

    if (postError) throw postError;

    let likedBy = post.liked_by || [];
    let newLikes = post.likes;
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

    // Update the post with new likes count and liked_by array
    const { error: updateError } = await supabase
      .from("posts")
      .update({ likes: newLikes, liked_by: likedBy })
      .eq("id", postId);

    if (updateError) throw updateError;

    return NextResponse.json({ likes: newLikes, action });
  } catch (error) {
    console.error("Error handling like:", error);
    return NextResponse.json(
      { error: "Failed to handle like" },
      { status: 500 },
    );
  }
}
