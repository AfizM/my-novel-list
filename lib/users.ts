import { supabase } from "./supabase-server";

export interface User {
  user_id: string;
  username: string;
  image_url: string;
  banner_url: string;
  about_me?: string;
  firstName?: string;
  lastName?: string;
  id?: string;
}

export async function getUserByUsername(
  username: string,
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) {
    return null;
  }

  // Add cache-busting parameter to banner_url
  if (data.banner_url) {
    data.banner_url = `${data.banner_url}?t=${Date.now()}`;
  }

  return data as User;
}
