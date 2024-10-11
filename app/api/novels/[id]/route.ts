import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = params.id;

  const { data, error } = await supabase
    .from("novels")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching novel:", error);
    return NextResponse.json({ error: "Novel not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
