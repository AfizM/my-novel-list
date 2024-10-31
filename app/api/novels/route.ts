import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort");
  const status = searchParams.get("status");
  const genre = searchParams.get("genre");
  const search = searchParams.get("search");
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = parseInt(searchParams.get("limit") || "20");
  const origin = searchParams.get("origin");
  const minChapters = parseInt(searchParams.get("min_chapters") || "0");

  let query = supabase.from("novels").select("*", { count: "exact" });

  if (status) {
    query = query.eq("complete_original", status === "Completed");
  }

  if (genre && genre !== "Any") {
    query = query.contains("genres", [genre.toLowerCase()]);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,assoc_names.cs.{${search}}`);
  }

  if (origin && origin !== "any") {
    query = query.eq("original_language", origin.toLowerCase());
  }

  if (minChapters > 0) {
    query = query.gte("chapters_count", minChapters);
  }

  if (sort) {
    switch (sort) {
      case "popular":
        query = query.order("on_reading_lists", { ascending: false });
        break;
      case "recent":
        query = query.order("created_at", { ascending: false });
        break;
      case "rating":
        query = query.order("rating", { ascending: false });
        break;
      case "name":
        query = query.order("name");
        break;
      default:
        query = query.order("on_reading_lists", { ascending: false });
    }
  }

  query = query.range(offset, offset + limit - 1);

  console.log("Final query:", query);

  try {
    const { data, count, error } = await query;

    if (error) {
      console.error("Query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to fetch novels" },
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
    const novelData = await request.json();

    // Add created_at and updated_at fields
    novelData.created_at = new Date().toISOString();
    novelData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("novels")
      .insert(novelData)
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
