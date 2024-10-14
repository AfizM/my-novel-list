import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { review_id, comment } = await request.json();

    const { data, error } = await supabase.from("review_comments").insert({
      review_id,
      user_id: userId,
      comment,
    }).select(`
        id,
        comment,
        created_at,
        users!inner (image_url, first_name, last_name)
      `);

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error posting comment:", error);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 },
    );
  }
}
