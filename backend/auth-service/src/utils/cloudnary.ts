import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { unlink } from "node:fs/promises";

export function hello() {
  console.log(cloudinary.config().cloud_name);
}

export async function uploadToCloudinary(
  photo: string,
  folder: string = "chat-profiles"
): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(photo, {
      folder,
    });
    
    try {
      await unlink(photo);
    } catch (unlinkError) {
      console.error(`Failed to delete local file ${photo}:`, unlinkError);
    }

    return result.secure_url;
  } catch (error) {
    throw error;
  }
}
