import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const targetUsername = params.userId;
  console.log("FETCHING FAVORITE NOVELS " + targetUsername);

  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("user_id")
      .eq("username", targetUsername)
      .single();

    if (userError) throw userError;

    const { data, error } = await supabase
      .from("novel_list")
      .select(
        `
        *,
        novels (
          id,
          title,
          image
        )
      `,
      )
      .eq("user_id", userData.user_id)
      .eq("is_favorite", true);

    if (error) throw error;

    const formattedData = data.map((item) => ({
      id: item.novel_id,
      title: item.novels.title,
      image: item.novels.image,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching favorite novels:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorite novels" },
      { status: 500 },
    );
  }
}
