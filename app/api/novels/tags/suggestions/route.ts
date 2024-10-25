// @ts-nocheck
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

let cachedTags: string[] | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let lastCacheTime = 0;

async function getAllUniqueTags(): Promise<string[]> {
  const currentTime = Date.now();
  if (cachedTags && currentTime - lastCacheTime < CACHE_DURATION) {
    return cachedTags;
  }

  try {
    const { data, error } = await supabase
      .from("novels")
      .select("tags")
      .not("tags", "is", null);

    if (error) throw error;

    const allTags = [...new Set(data.flatMap((novel) => novel.tags || []))];
    cachedTags = allTags;
    lastCacheTime = currentTime;
    return allTags;
  } catch (error) {
    console.error("Error fetching all tags:", error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const allTags = await getAllUniqueTags();

    const suggestions = allTags
      .filter((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase());
        const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase());
        if (aStartsWith && !bStartsWith) return -1;
        if (!bStartsWith && aStartsWith) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 10);

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error fetching tag suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch tag suggestions" },
      { status: 500 }
    );
  }
}
