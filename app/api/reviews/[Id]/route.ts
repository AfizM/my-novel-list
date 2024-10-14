import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: { Id: string } },
) {
  const novelId = parseInt(params.Id);
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    const {
      data: reviews,
      error,
      count,
    } = await supabase
      .from("reviews")
      .select(
        `
        *,
        users!inner (image_url, first_name, last_name),
        review_comments (
          id,
          comment,
          created_at,
          users!inner (image_url, first_name, last_name)
        ),
        likes:review_likes(count)
      `,
        { count: "exact" },
      )
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    reviews;

    const reviewsWithLikeCount = reviews.map((review) => ({
      ...review,
      likes: review.likes[0].count,
    }));

    return NextResponse.json({ reviews: reviewsWithLikeCount, count });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}
