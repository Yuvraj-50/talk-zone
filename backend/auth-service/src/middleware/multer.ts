import multer from "multer";
import fs from "node:fs/promises";
import path from "node:path";

const PhotosPath = path.resolve(__dirname, "../../uploads");

export async function ensureUploadDirExist() {
  try {
    await fs.mkdir(PhotosPath, { recursive: true });
  } catch (error) {
    console.log("Error creating the multer folder");
  }
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, PhotosPath);
  },

  filename(req, file, callback) {
    callback(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

export default upload;
