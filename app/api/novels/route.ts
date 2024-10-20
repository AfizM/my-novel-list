import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort");
  const status = searchParams.get("status");
  const genre = searchParams.get("genre");
  const search = searchParams.get("search");
  const offset = parseInt(searchParams.get("offset") || "0");
  const limit = parseInt(searchParams.get("limit") || "20");

  let query = supabase.from("novels").select("*", { count: "exact" });

  if (status) {
    query = query.eq("complete_original", status === "Completed");
  }

  if (genre) {
    query = query.contains("genres", [genre]);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,assoc_names.cs.{${search}}`);
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

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}
