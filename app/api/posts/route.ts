import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

const POSTS_PER_PAGE = 15;

export async function GET(request: Request) {
  const { userId } = auth();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const tab = searchParams.get("tab") || "global";
  const offset = (page - 1) * POSTS_PER_PAGE;
  console.log("userId", userId);
  console.log("TAB", tab);

  try {
    let query = supabase.from("posts").select(
      `
        id,
        content,
        likes,
        liked_by,
        created_at,
        novel_id,
        user_id,
        novels (
          id,
          name,
          cover_image_url
        ),
        users:users!posts_user_id_fkey (
          username,
          image_url
        ),
        target:users!posts_target_user_id_fkey (
          username,
          image_url
        ),
        post_comments (
          id,
          content,
          likes,
          liked_by,
          created_at,
          users!inner (
            username,
            image_url
          )
        )
      `,
      { count: "exact" },
    );

    // If tab is "following" and user is logged in, filter by followed users
    if (tab === "following" && userId) {
      const { data: followedUsers } = await supabase
        .from("user_relationships")
        .select("following_id")
        .eq("follower_id", userId);

      if (followedUsers && followedUsers.length > 0) {
        const followedUserIds = followedUsers.map(
          (relation) => relation.following_id,
        );
        query = query.in("user_id", [userId, ...followedUserIds]);
      } else {
        // If user follows no one, only show their own posts
        query = query.eq("user_id", userId);
      }
    }

    const {
      data: posts,
      error,
      count,
    } = await query
      .range(offset, offset + POSTS_PER_PAGE - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      users: post.users, // Keep the author info
      target: undefined, // Remove target from response
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

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content, novel_id, target_user_id } = await request.json();

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
        content,
        novel_id,
        liked_by: [],
        target_user_id: target_user_id || userId,
      })
      .select(
        `
        id,
        content,
        likes,
        liked_by,
        created_at,
        novel_id,
        target_user_id,
        novels (
          id,
          name,
          cover_image_url
        ),
        users:users!posts_user_id_fkey (
          username,
          image_url
        ),
        target:users!posts_target_user_id_fkey (
          username,
          image_url
        )
      `,
      )
      .single();

    if (error) throw error;

    // Format the response to match the expected structure
    const postWithComments = {
      ...data,
      users: data.users, // Keep the author info as users
      target: undefined, // Remove target from final response
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
