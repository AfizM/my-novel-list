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
      // First fetch the highest ID from the novels table
      const { data: maxIdResult, error: maxIdError } = await supabase
        .from("novels")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      if (maxIdError) throw maxIdError;

      // Calculate the next ID (handle case where table might be empty)
      const nextId =
        maxIdResult && maxIdResult.length > 0
          ? Number(maxIdResult[0].id) + 1
          : 1;

      // Fetch the submission
      const { data: submission, error: submissionError } = await supabase
        .from("novel_submissions")
        .select("*")
        .eq("id", params.id)
        .single();

      if (submissionError) throw submissionError;

      // Extract only the fields that should go into the novels table
      const novelData = {
        id: nextId, // Add the calculated ID
        name: submission.name,
        original_language: submission.original_language,
        authors: submission.authors,
        genres: submission.genres,
        original_publisher: submission.original_publisher,
        description: submission.description,
        complete_original: submission.complete_original,
        cover_image_url: submission.cover_image_url,
        rating: 0,
      };

      // Insert into novels table
      const { error: novelError } = await supabase
        .from("novels")
        .insert(novelData);

      if (novelError) throw novelError;

      // Update submission status
      const { error: updateError } = await supabase
        .from("novel_submissions")
        .update({ status: "approved" })
        .eq("id", params.id);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true });
    } else if (status === "rejected") {
      // Update submission status
      const { error: updateError } = await supabase
        .from("novel_submissions")
        .update({ status: "rejected", feedback })
        .eq("id", params.id);

      if (updateError) throw updateError;

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
