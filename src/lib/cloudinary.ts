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
 * Deletes an image from Cloudinary by its public ID or full URL.
 * @param identifier - public_id or Cloudinary secure_url
 */
export async function deleteImage(identifier: string) {
  let publicId = identifier;

  // If it's a URL, extract the public_id
  if (identifier.startsWith('http')) {
    // Example: https://res.cloudinary.com/demo/image/upload/v12345678/products/sample.jpg
    // We need "products/sample"
    const parts = identifier.split('/');
    const lastPart = parts.pop() || ""; // sample.jpg
    const folderPart = parts.pop() || ""; // products
    const fileName = lastPart.split('.')[0]; // sample
    
    if (folderPart !== 'upload' && folderPart !== 'image') {
      publicId = `${folderPart}/${fileName}`;
    } else {
      publicId = fileName;
    }
  }

  console.log(`Deleting Cloudinary image: ${publicId}`);
  return cloudinary.uploader.destroy(publicId);
}
