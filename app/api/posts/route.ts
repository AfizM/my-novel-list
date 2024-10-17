import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({ user_id: userId, content })
      .select(
        `
        id,
        content,
        likes,
        created_at,
        users!inner (first_name, last_name, image_url)
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

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    const { data, error, count } = await supabase
      .from("posts")
      .select(
        `
        id,
        content,
        likes,
        liked_by,
        created_at,
        users!inner (first_name, last_name, image_url),
        post_comments (
          id,
          post_id,
          content,
          created_at,
          likes,
          liked_by,
          users!inner (first_name, last_name, image_url)
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const postsWithLikeStatus = data.map((post) => ({
      ...post,
      is_liked: post.liked_by?.includes(userId) || false,
      liked_by: undefined,
    }));

    return NextResponse.json({ posts: postsWithLikeStatus, count });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
