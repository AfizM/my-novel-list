import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { username: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetUsername = params.userId;

  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id")
      .eq("username", targetUsername)
      .single();

    if (userError) throw userError;

    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        users!inner (username, image_url),
        novels (
          id,
          name,
          cover_image_url
        ),
        post_comments (
          id,
          content,
          created_at,
          likes,
          liked_by,
          users!inner (username, image_url)
        )
      `,
      )
      .eq("user_id", userData.user_id)
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
