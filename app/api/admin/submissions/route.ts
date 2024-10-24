import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

const ITEMS_PER_PAGE = 10;

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");

  try {
    // Check if the user is an admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("user_id", userId)
      .single();

    if (userError || !userData.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch submissions with pagination
    const {
      data: submissions,
      error,
      count,
    } = await supabase
      .from("novel_submissions")
      .select("*", { count: "exact" })
      .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

    return NextResponse.json({ submissions, totalPages });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
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
    const submissionData = await request.json();
    submissionData.user_id = userId;
    submissionData.status = "pending";

    const { data, error } = await supabase
      .from("novel_submissions")
      .insert(submissionData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error submitting novel:", error);
    return NextResponse.json(
      { error: "Failed to submit novel" },
      { status: 500 },
    );
  }
}
