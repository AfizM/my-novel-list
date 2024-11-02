import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

const POSTS_PER_PAGE = 15;

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, novel_id } = await request.json();

    // Validate that the content isn't just HTML tags without text
    const strippedContent = content.replace(/<[^>]*>/g, "").trim();
    if (!strippedContent) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        content, // This will store the HTML content
        novel_id,
        liked_by: [],
      })
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
          name,
          cover_image_url
        ),
        users (
          username,
          image_url
        )
      `,
      )
      .single();

    if (error) throw error;

    // Add post_comments array to match the expected Post interface
    const postWithComments = {
      ...data,
      post_comments: [],
      is_liked: false,
    };

    return NextResponse.json(postWithComments);
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
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const offset = (page - 1) * POSTS_PER_PAGE;

  try {
    const {
      data: posts,
      error,
      count,
    } = await supabase
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
          name,
          cover_image_url
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
        { count: "exact" },
      )
      .range(offset, offset + POSTS_PER_PAGE - 1)
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

    return NextResponse.json({
      posts: postsWithLikeStatus,
      hasMore: count > offset + POSTS_PER_PAGE,
      totalCount: count,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
