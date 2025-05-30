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

  if (!reviewId) {
    return NextResponse.json(
      { error: "Review ID is required" },
      { status: 400 },
    );
  }

  try {
    // Get the current review data
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("likes, liked_by")
      .eq("id", reviewId)
      .single();

    if (reviewError) throw reviewError;

    let likedBy = review.liked_by || [];
    let newLikes = review.likes || 0;
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

    // Update the review with new likes count and liked_by array
    const { error: updateError } = await supabase
      .from("reviews")
      .update({ likes: newLikes, liked_by: likedBy })
      .eq("id", reviewId);

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
