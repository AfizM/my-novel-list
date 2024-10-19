import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = params.userId;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "recent";
  const limit = 10;

  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id")
      .eq("username", username)
      .single();

    if (userError) throw userError;

    let query = supabase
      .from("reviews")
      .select(
        `
        *,
        novels (
          id,
          title,
          image
        )
      `,
        { count: "exact" },
      )
      .eq("user_id", userData.user_id)
      .range((page - 1) * limit, page * limit - 1);

    switch (sort) {
      case "likes":
        query = query.order("likes", { ascending: false });
        break;
      case "rating":
        query = query.order("rating", { ascending: false });
        break;
      case "recent":
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const reviewsWithLikeStatus = data.map((review) => ({
      ...review,
      is_liked: review.liked_by?.includes(userId) || false,
      liked_by: undefined,
    }));

    return NextResponse.json({
      reviews: reviewsWithLikeStatus,
      hasMore: count !== null ? page * limit < count : false,
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch user reviews" },
      { status: 500 },
    );
  }
}
