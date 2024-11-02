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
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Add cache-busting parameter to banner_url and image_url
    if (data.banner_url) {
      data.banner_url = `${data.banner_url}?t=${Date.now()}`;
    }
    if (data.image_url) {
      data.image_url = `${data.image_url}?t=${Date.now()}`;
    }

    return data as User;
  } catch (error) {
    console.error("Unexpected error in getUserByUsername:", error);
    return null;
  }
}
