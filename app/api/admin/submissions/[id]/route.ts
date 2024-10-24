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

    const { status, feedback } = await request.json();

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
        .insert({
          name: submission.name,
          assoc_names: submission.assoc_names,
          original_language: submission.original_language,
          authors: submission.authors,
          genres: submission.genres,
          tags: submission.tags,
          cover_image_url: submission.cover_image_url,
          start_year: submission.start_year,
          licensed: submission.licensed,
          original_publisher: submission.original_publisher,
          english_publisher: submission.english_publisher,
          complete_original: submission.complete_original,
          chapters_original_current: submission.chapters_original_current,
          complete_translated: submission.complete_translated,
          chapter_latest_translated: submission.chapter_latest_translated,
          release_freq: submission.release_freq,
          description: submission.description,
        })
        .select()
        .single();

      if (novelError) throw novelError;

      // Update submission status
      const { error: updateError } = await supabase
        .from("novel_submissions")
        .update({ status: "approved" })
        .eq("id", params.id);

      if (updateError) throw updateError;

      return NextResponse.json(novel);
    } else if (status === "rejected") {
      // Update submission status
      const { error: updateError } = await supabase
        .from("novel_submissions")
        .update({ status: "rejected", feedback })
        .eq("id", params.id);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Failed to update submission" },
      { status: 500 },
    );
  }
}
