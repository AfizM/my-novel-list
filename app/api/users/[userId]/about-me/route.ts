import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";
import DOMPurify from "isomorphic-dompurify";

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = params.userId;
  const { about_me } = await request.json();

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(about_me, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "a",
      "img",
      "span",
      "h1",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
    ],
    ALLOWED_ATTR: ["href", "src", "class", "alt", "spoiler"],
  });

  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id")
      .eq("username", username)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userData.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("users")
      .update({ about_me: sanitizedContent })
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json({ message: "About me updated successfully" });
  } catch (error) {
    console.error("Error updating about me:", error);
    return NextResponse.json(
      { error: "Failed to update about me" },
      { status: 500 },
    );
  }
}
