// @ts-nocheck
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { novel_id, status, chapter_progress, rating, notes, is_favorite } =
    await request.json();

  try {
    // Get the current max favorite_order for the user
    const { data: maxOrderData, error: maxOrderError } = await supabase
      .from("novel_list")
      .select("favorite_order")
      .eq("user_id", userId)
      .eq("is_favorite", true)
      .order("favorite_order", { ascending: false })
      .limit(1);

    if (maxOrderError) throw maxOrderError;

    const newFavoriteOrder =
      maxOrderData.length > 0 ? maxOrderData[0].favorite_order + 1 : 1;

    // Create the data object to be inserted
    const novelData = {
      user_id: userId,
      novel_id,
      status,
      chapter_progress,
      rating,
      notes,
      is_favorite,
      updated_at: new Date().toISOString(),
    };

    // Add favorite_order to the data object if is_favorite is true
    if (is_favorite) {
      novelData.favorite_order = newFavoriteOrder;
    }

    const { data, error } = await supabase
      .from("novel_list")
      .upsert(novelData, { onConflict: "user_id, novel_id" });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error saving novel list:", error);
    return NextResponse.json(
      { error: "Failed to save novel to list" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("novel_list")
      .select(
        `
        *,
        novels (
          id,
          name,
          cover_image_url,
          original_language
        )
      `
      )
      .eq("user_id", userId);

    if (error) throw error;

    const formattedData = data.map((item) => ({
      ...item,
      ...item.novels,
      novels: undefined,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching novel list:", error);
    return NextResponse.json(
      { error: "Failed to fetch novel list" },
      { status: 500 }
    );
  }
}
