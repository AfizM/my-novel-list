import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const postId = params.id;

  try {
    // First verify the post exists and belongs to the user
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      throw fetchError;
    }

    if (!post || post.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the post
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
}
