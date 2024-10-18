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
    const { data, error } = await supabase.from("novel_list").upsert(
      {
        user_id: userId,
        novel_id,
        status,
        chapter_progress,
        rating,
        notes,
        is_favorite,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id, novel_id" },
    );

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error saving novel list:", error);
    return NextResponse.json(
      { error: "Failed to save novel to list" },
      { status: 500 },
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
          title,
          image,
          country
        )
      `,
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
      { status: 500 },
    );
  }
}
