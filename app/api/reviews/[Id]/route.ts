import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { Id: string } },
) {
  const { userId } = auth();

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
        users!inner (username, image_url),
        review_comments (
          id,
          comment,
          created_at,
          likes,
          liked_by,
          users!inner (username, image_url)
        )
      `,
        { count: "exact" },
      )
      .eq("novel_id", novelId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const reviewsWithLikeStatus = reviews.map((review) => ({
      ...review,
      is_liked: review.liked_by?.includes(userId) || false,
      liked_by: undefined,
      review_comments: review.review_comments.map((comment) => ({
        ...comment,
        is_liked: comment.liked_by?.includes(userId) || false,
        liked_by: undefined,
      })),
    }));

    return NextResponse.json({ reviews: reviewsWithLikeStatus, count });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { Id: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      rating,
      review_description,
      plot_rating,
      characters_rating,
      world_building_rating,
      writing_style_rating,
    } = await request.json();

    // Check if the review belongs to the user
    const { data: existingReview, error: existingReviewError } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", params.Id)
      .single();

    if (existingReviewError) throw existingReviewError;

    if (existingReview.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("reviews")
      .update({
        rating,
        review_description,
        plot_rating,
        characters_rating,
        world_building_rating,
        writing_style_rating,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.Id)
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 },
    );
  }
}
