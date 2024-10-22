import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

const MAX_TAG_LENGTH = 50;
const TAG_REGEX = /^[a-zA-Z0-9\s-]+$/;

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const novelId = params.id;
  const { tag } = await request.json();

  // Validate tag
  if (
    !tag ||
    typeof tag !== "string" ||
    tag.length > MAX_TAG_LENGTH ||
    !TAG_REGEX.test(tag)
  ) {
    return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
  }

  // Sanitize tag
  const sanitizedTag = tag.trim().toLowerCase();

  try {
    // Fetch current tags
    const { data: novel, error: fetchError } = await supabase
      .from("novels")
      .select("tags")
      .eq("id", novelId)
      .single();

    if (fetchError) throw fetchError;

    // Add new tag if it doesn't exist
    const updatedTags = [...new Set([...(novel.tags || []), sanitizedTag])];

    // Update the novel with new tags
    const { data, error } = await supabase
      .from("novels")
      .update({ tags: updatedTags })
      .eq("id", novelId)
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Error adding tag:", error);
    return NextResponse.json({ error: "Failed to add tag" }, { status: 500 });
  }
}
