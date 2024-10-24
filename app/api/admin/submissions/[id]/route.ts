import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const { status, feedback, ...submissionData } = await request.json();

    if (status === "approved") {
      // Fetch the submission
      const { data: submission, error: submissionError } = await supabase
        .from("novel_submissions")
        .select("*")
        .eq("id", params.id)
        .single();

      if (submissionError) throw submissionError;

      // Insert into novels table
      const { data: novel, error: novelError } = await supabase
        .from("novels")
        .insert(submission)
        .select()
        .single();

      if (novelError) throw novelError;

      // Update submission status
      const { error: updateError } = await supabase
        .from("novel_submissions")
        .update({ status: "approved" })
        .eq("id", params.id);

      if (updateError) throw updateError;

      // Notify the user
      await notifyUser(submission.user_id, "approved", novel.id);

      return NextResponse.json(novel);
    } else if (status === "rejected") {
      // Update submission status
      const { error: updateError } = await supabase
        .from("novel_submissions")
        .update({ status: "rejected", feedback })
        .eq("id", params.id);

      if (updateError) throw updateError;

      // Fetch the submission to get the user_id
      const { data: submission, error: submissionError } = await supabase
        .from("novel_submissions")
        .select("user_id")
        .eq("id", params.id)
        .single();

      if (submissionError) throw submissionError;

      // Notify the user
      await notifyUser(submission.user_id, "rejected", null, feedback);

      return NextResponse.json({ success: true });
    } else {
      // Update submission data
      const { error: updateError } = await supabase
        .from("novel_submissions")
        .update(submissionData)
        .eq("id", params.id);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 },
    );
  }
}

async function notifyUser(
  userId: string,
  status: "approved" | "rejected",
  novelId: number | null,
  feedback?: string,
) {
  try {
    const message =
      status === "approved"
        ? `Your novel submission has been approved! You can view it here: /novel/${novelId}`
        : `Your novel submission has been rejected. Feedback: ${feedback}`;

    await supabase.from("notifications").insert({
      user_id: userId,
      message,
      type: "submission_" + status,
      novel_id: novelId,
    });
  } catch (error) {
    console.error("Error notifying user:", error);
  }
}
