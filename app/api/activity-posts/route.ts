import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { novel_id, content } = await request.json();

    const { data, error } = await supabase
      .from("activity_posts")
      .insert({ user_id: userId, novel_id, content, liked_by: [] })
      .select(
        `
        id,
        content,
        likes,
        liked_by,
        created_at,
        novels (
          id,
          title,
          image
        )
      `,
      )
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating activity post:", error);
    return NextResponse.json(
      { error: "Failed to create activity post" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: activityPosts, error } = await supabase
      .from("activity_posts")
      .select(
        `
        id,
        content,
        likes,
        liked_by,
        created_at,
        novels (
          id,
          title,
          image
        ),
        users (
          first_name,
          last_name,
          image_url
        ),
        activity_post_comments (
          id,
          content,
          likes,
          liked_by,
          created_at,
          users (
            first_name,
            last_name,
            image_url
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    const postsWithLikeStatus = activityPosts.map((post) => ({
      ...post,
      is_liked: post.liked_by?.includes(userId) || false,
      liked_by: undefined,
      activity_post_comments: post.activity_post_comments.map((comment) => ({
        ...comment,
        is_liked: comment.liked_by?.includes(userId) || false,
        liked_by: undefined,
      })),
    }));

    return NextResponse.json(postsWithLikeStatus);
  } catch (error) {
    console.error("Error fetching activity posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity posts" },
      { status: 500 },
    );
  }
}
