import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ isAdmin: false });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("is_admin")
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    return NextResponse.json({ isAdmin: data?.is_admin || false });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
