import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      novel_id,
      rating,
      review_description,
      plot_rating,
      characters_rating,
      world_building_rating,
      writing_style_rating,
    } = await request.json();

    // Check if a review already exists
    const { data: existingReview, error: existingReviewError } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("novel_id", novel_id)
      .single();

    if (existingReviewError && existingReviewError.code !== "PGRST116") {
      throw existingReviewError;
    }

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this novel" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        user_id: userId,
        novel_id,
        rating,
        review_description,
        plot_rating,
        characters_rating,
        world_building_rating,
        writing_style_rating,
      })
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      id,
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
      .eq("id", id)
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
      })
      .eq("id", id)
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
