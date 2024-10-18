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
    const { data: novelList, error: novelListError } = await supabase
      .from("novel_list")
      .select("status, rating, novels(genres)")
      .eq("user_id", targetUserId);

    if (novelListError) throw novelListError;

    console.log("Novel List:", JSON.stringify(novelList, null, 2));

    const novelsRead = novelList.filter(
      (item) => item.status === "completed",
    ).length;

    const ratings = novelList
      .map((item) => item.rating)
      .filter((rating) => rating !== null);
    const avgRating =
      ratings.length > 0
        ? (
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          ).toFixed(1)
        : "N/A";

    const genreCounts = novelList.reduce((acc, item) => {
      item.novels.genres.forEach((genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    }, {});

    const favoriteGenre =
      Object.entries(genreCounts).length > 0
        ? Object.entries(genreCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
        : "N/A";

    return NextResponse.json({
      novelsRead,
      avgRating,
      favoriteGenre,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 },
    );
  }
}
