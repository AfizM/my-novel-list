import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort");
  const status = searchParams.get("status");
  const genre = searchParams.get("genre");
  const search = searchParams.get("search");

  let query = supabase.from("novels").select("*");

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

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
