import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId: currentUserId } = auth();
  if (!currentUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetUserId = params.userId;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("banner_url")
      .eq("user_id", targetUserId)
      .single();

    if (error) throw error;

    return new NextResponse(JSON.stringify({ bannerUrl: data?.banner_url }), {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching user banner:", error);
    return NextResponse.json(
      { error: "Failed to fetch user banner" },
      { status: 500 },
    );
  }
}
