import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

const ITEMS_PER_PAGE = 10;

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const offset = (page - 1) * limit;

    // Join with users table to get username
    const { data: submissions, error } = await supabase
      .from("novel_submissions")
      .select(
        `
        *,
        profiles:user_id (
          username
        )
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Transform the data to include username directly
    const transformedSubmissions = submissions.map((submission) => ({
      ...submission,
      username: submission.profiles?.username || "Unknown User",
    }));

    // Get total count for pagination
    const { count } = await supabase
      .from("novel_submissions")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      submissions: transformedSubmissions,
      totalPages: Math.ceil((count || 0) / limit),
    });
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
