import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId } = auth();

  const targetUserId = params.userId;

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
      `,
      )
      .eq("user_id", targetUserId);

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
