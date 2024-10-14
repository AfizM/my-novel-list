import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { Id: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reviewId = params.Id;

  try {
    const { data, error } = await supabase
      .from("review_likes")
      .select()
      .eq("user_id", userId)
      .eq("review_id", reviewId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ isLiked: !!data });
  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json(
      { error: "Failed to check like status" },
      { status: 500 },
    );
  }
}
