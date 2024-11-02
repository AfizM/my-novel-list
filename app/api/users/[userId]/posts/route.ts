// @ts-nocheck
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

const POSTS_PER_PAGE = 15;

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId } = auth();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const offset = (page - 1) * POSTS_PER_PAGE;

  const targetUsername = params.userId;

  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id")
      .eq("username", targetUsername)
      .single();

    if (userError) throw userError;

    const { data, error, count } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:users!posts_user_id_fkey (
          username,
          image_url
        ),
        target:users!posts_target_user_id_fkey (
          username,
          image_url
        ),
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
          users!inner (
            username,
            image_url
          )
        )
      `,
        { count: "exact" },
      )
      .or(
        `user_id.eq.${userData.user_id},target_user_id.eq.${userData.user_id}`,
      )
      .range(offset, offset + POSTS_PER_PAGE - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const transformedPosts = data.map((post) => ({
      ...post,
      users: post.author,
      author: undefined,
      target: undefined,
      is_liked: post.liked_by?.includes(userId) || false,
      liked_by: undefined,
      post_comments: post.post_comments.map((comment) => ({
        ...comment,
        is_liked: comment.liked_by?.includes(userId) || false,
        liked_by: undefined,
      })),
    }));

    return NextResponse.json({
      posts: transformedPosts,
      hasMore: count > offset + POSTS_PER_PAGE,
      totalCount: count,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch user posts" },
      { status: 500 },
    );
  }
}
