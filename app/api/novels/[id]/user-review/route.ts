import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const novelId = params.id;

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", userId)
      .eq("novel_id", novelId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json(data || null);
  } catch (error) {
    console.error("Error fetching user review:", error);
    return NextResponse.json(
      { error: "Failed to fetch user review" },
      { status: 500 },
    );
  }
}
