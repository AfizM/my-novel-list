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

    // Call the Supabase function
    const { data, error } = await supabase.rpc(
      "create_or_update_review_and_update_novel",
      {
        p_user_id: userId,
        p_novel_id: novel_id,
        p_rating: rating,
        p_review_description: review_description,
        p_plot_rating: plot_rating,
        p_characters_rating: characters_rating,
        p_world_building_rating: world_building_rating,
        p_writing_style_rating: writing_style_rating,
      },
    );

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 },
    );
  }
}
