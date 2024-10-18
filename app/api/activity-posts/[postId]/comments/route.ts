import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { postId: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = params;
  const { content } = await request.json();

  try {
    const { data, error } = await supabase
      .from("activity_post_comments")
      .insert({ user_id: userId, activity_post_id: postId, content })
      .select(
        `
        id,
        content,
        created_at,
        likes,
        users (first_name, last_name, image_url)
      `,
      )
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating activity post comment:", error);
    return NextResponse.json(
      { error: "Failed to create activity post comment" },
      { status: 500 },
    );
  }
}
