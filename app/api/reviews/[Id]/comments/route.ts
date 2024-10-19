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

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("review_comments")
      .insert({ user_id: userId, review_id, comment })
      .select(
        `
        id,
        comment,
        created_at,
        users!inner (username, image_url)
      `,
      )
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
