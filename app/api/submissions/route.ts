import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

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
