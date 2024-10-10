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

  console.log(offset, limit);

  let query = supabase.from("novels").select("*", { count: "exact" });

  if (status && status !== "Any") {
    query = query.eq("status", status);
  }

  if (genre && genre !== "Any") {
    query = query.contains("genres", [genre]);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (sort) {
    switch (sort) {
      case "popular":
        query = query.order("views", { ascending: false });
        break;
      case "recent":
        query = query.order("created_at", { ascending: false });
        break;
      case "rating":
        query = query.order("ratings", { ascending: false });
        break;
      default:
        query = query.order("title");
    }
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count });
}
