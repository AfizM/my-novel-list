// @ts-nocheck
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase-server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            public_id: `user_banners/${userId}`,
            overwrite: true,
            format: "jpg",
            transformation: [
              { width: 1500, height: 500, crop: "fill" },
              { quality: "auto:good" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    // Update user's banner URL in the database
    await updateUserBanner(userId, result.secure_url);

    return NextResponse.json({ bannerUrl: result.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

async function updateUserBanner(userId: string, bannerUrl: string) {
  try {
    const { error } = await supabase
      .from("users")
      .update({ banner_url: bannerUrl })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating user banner:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateUserBanner:", error);
    throw error;
  }
}
