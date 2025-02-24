import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

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
      public_id: "photo",
    });

    const optimizedUrl = cloudinary.url(result.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    return optimizedUrl;
  } catch (error) {
    throw error;
  }
}
