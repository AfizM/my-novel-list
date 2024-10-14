import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { novelId: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const novelId = params.novelId;

  try {
    const { data, error } = await supabase
      .from("novel_list")
      .select("*")
      .eq("user_id", userId)
      .eq("novel_id", novelId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Novel not found in user's list" },
          { status: 404 },
        );
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching novel data:", error);
    return NextResponse.json(
      { error: "Failed to fetch novel data" },
      { status: 500 },
    );
  }
}
