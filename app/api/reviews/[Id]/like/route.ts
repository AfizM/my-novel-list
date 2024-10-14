import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { Id: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reviewId = params.Id;

  try {
    // Check if the user has already liked this review
    const { data: existingLike, error: likeError } = await supabase
      .from("review_likes")
      .select()
      .eq("user_id", userId)
      .eq("review_id", reviewId)
      .single();

    if (likeError && likeError.code !== "PGRST116") throw likeError;

    let action;
    if (existingLike) {
      // User has already liked, so unlike
      await supabase
        .from("review_likes")
        .delete()
        .eq("user_id", userId)
        .eq("review_id", reviewId);
      action = "unliked";
    } else {
      // User hasn't liked, so add like
      await supabase
        .from("review_likes")
        .insert({ user_id: userId, review_id: reviewId });
      action = "liked";
    }

    // Get updated likes count
    const { count, error: countError } = await supabase
      .from("review_likes")
      .select("*", { count: "exact", head: true })
      .eq("review_id", reviewId);

    if (countError) throw countError;

    return NextResponse.json({ likes: count, action });
  } catch (error) {
    console.error("Error handling like:", error);
    return NextResponse.json(
      { error: "Failed to handle like" },
      { status: 500 },
    );
  }
}
