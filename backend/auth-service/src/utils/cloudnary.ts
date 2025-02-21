import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

export function hello() {
  console.log(cloudinary.config().cloud_name);
}

export async function uploadToCloudinary(photo: string) {
  try {
    const result: UploadApiResponse = await cloudinary.uploader.upload(photo, {
      public_id: "photo",
    });

    const optimizeUrl = cloudinary.url("photo", {
      fetch_format: "auto",
      quality: "auto",
    });

    return optimizeUrl;
  } catch (error) {
    console.log("error", JSON.stringify(error, null, 2));
  }
}
