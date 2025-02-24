import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary() {
  const ConfigOptions = cloudinary.config();
  console.log(ConfigOptions);
}

export async function uploadToCloudinary(
  base64String: string,
  folder: string = "chat-profiles"
): Promise<string> {
  try {
    // Create a promise to handle the upload
    return new Promise((resolve, reject) => {
      // Upload the base64 string directly
      cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64String}`,
        {
          folder,
          resource_type: "auto", // Automatically detect file type
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
            return;
          }
          resolve(result?.secure_url || "");
        }
      );
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}
