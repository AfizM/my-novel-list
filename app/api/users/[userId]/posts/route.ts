import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetUserId = params.userId;

  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        users!inner (first_name, last_name, image_url),
        novels (
          id,
          title,
          image
        ),
        post_comments (
          id,
          content,
          created_at,
          likes,
          liked_by,
          users!inner (first_name, last_name, image_url)
        )
      `,
      )
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const postsWithLikeStatus = data.map((post) => ({
      ...post,
      is_liked: post.liked_by?.includes(userId) || false,
      liked_by: undefined,
      post_comments: post.post_comments.map((comment) => ({
        ...comment,
        is_liked: comment.liked_by?.includes(userId) || false,
        liked_by: undefined,
      })),
    }));

    return NextResponse.json(postsWithLikeStatus);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch user posts" },
      { status: 500 },
    );
  }
}
