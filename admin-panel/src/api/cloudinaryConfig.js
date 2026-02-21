// src/api/cloudinaryConfig.js
import axios from "axios";

// NOTE: Fill in your Cloudinary credentials here
const CLOUD_NAME = "deh3ghifd";
const UPLOAD_PRESET = "ingredients_icons"; // Create an unsigned preset in Cloudinary settings

export const uploadToCloudinary = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image to Cloudinary");
  }
};
// Utility to extract public ID from Cloudinary URL
export const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456789/folder/public_id.jpg
  const parts = url.split("/");
  const lastPart = parts[parts.length - 1]; // public_id.jpg
  const publicIdWithExtension = lastPart.split(".")[0];
  
  // If there are folders (everything between 'upload/v...' and the last part)
  const uploadIndex = parts.indexOf("upload");
  if (uploadIndex !== -1 && parts.length > uploadIndex + 2) {
    // If version exists (starts with 'v')
    const hasVersion = parts[uploadIndex + 1].startsWith("v");
    const startIndex = uploadIndex + (hasVersion ? 2 : 1);
    const folderParts = parts.slice(startIndex, parts.length - 1);
    if (folderParts.length > 0) {
      return [...folderParts, publicIdWithExtension].join("/");
    }
  }
  
  return publicIdWithExtension;
};

export const deleteFromCloudinary = async (url) => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;

  try {
    // We call our own backend because deletion requires API Secret
    await axios.post("http://localhost:5000/api/cloudinary/delete", { publicId });
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    // Don't throw, just log. Deletion failure shouldn't block the UI flow.
  }
};
