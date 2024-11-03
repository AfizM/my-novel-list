import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const identifier = params.userId;

  try {
    // Try to fetch by username first
    let query = supabase
      .from("users")
      .select("*")
      .eq("username", identifier)
      .single();

    let { data: userData, error } = await query;

    // If no result, try fetching by user_id
    if (!userData && !error) {
      query = supabase
        .from("users")
        .select("*")
        .eq("user_id", identifier)
        .single();

      const result = await query;
      userData = result.data;
      error = result.error;
    }

    if (error) throw error;
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 },
    );
  }
}
