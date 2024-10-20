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

  const targetUserId = params.userId;

  try {
    const { data, error } = await supabase
      .from("novel_list")
      .select(
        `
        *,
        novels (
          id,
          name,
          cover_image_url
        )
      `,
      )
      .eq("user_id", targetUserId)
      .eq("is_favorite", true)
      .order("favorite_order", { ascending: true });

    if (error) throw error;

    const formattedData = data.map((item) => ({
      id: item.novel_id,
      name: item.novels.name,
      cover_image_url: item.novels.cover_image_url,
      favoriteOrder: item.favorite_order,
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

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { userId } = auth();
  if (!userId || userId !== params.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { novels } = await request.json();
    console.log(novels);

    // Perform updates one by one
    for (let i = 0; i < novels.length; i++) {
      const { error } = await supabase
        .from("novel_list")
        .update({ favorite_order: i + 1 })
        .eq("user_id", userId)
        .eq("novel_id", novels[i].id)
        .eq("is_favorite", true);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating favorite novels order:", error);
    return NextResponse.json(
      { error: "Failed to update favorite novels order" },
      { status: 500 },
    );
  }
}
