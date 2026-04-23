import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_URL
    ? process.env.CLOUDINARY_URL.split("@")[1]
    : "",
  api_key: process.env.CLOUDINARY_API_KEY ?? "",
  api_secret: process.env.CLOUDINARY_URL
    ? process.env.CLOUDINARY_URL.split(":")[2]?.split("@")[0]
    : "",
  secure: true,
});

export default cloudinary;

/**
 * Uploads a base64 or buffer image to Cloudinary.
 * @param file  - base64 data URI or file path
 * @param folder - cloudinary folder (e.g. "products")
 */
export async function uploadImage(
  file: string,
  folder = "products"
): Promise<string> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: "image",
  });
  return result.secure_url;
}

/**
 * Deletes an image from Cloudinary by its public ID.
 */
export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}
