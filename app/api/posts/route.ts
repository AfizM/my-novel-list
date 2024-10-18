import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, novel_id } = await request.json();

    const { data, error } = await supabase
      .from("posts")
      .insert({ user_id: userId, content, novel_id, liked_by: [] })
      .select(
        `
        id,
        content,
        likes,
        liked_by,
        created_at,
        novel_id,
        novels (
          id,
          title,
          image
        ),
        users (
          username,
          image_url
        )
      `,
      )
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
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
    const { data: posts, error } = await supabase
      .from("posts")
      .select(
        `
        id,
        content,
        likes,
        liked_by,
        created_at,
        novel_id,
        novels (
          id,
          title,
          image
        ),
        users (
          username,
          image_url
        ),
        post_comments (
          id,
          content,
          likes,
          liked_by,
          created_at,
          users (
           username,
            image_url
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    const postsWithLikeStatus = posts.map((post) => ({
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
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
