import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Streams an in-memory file buffer (from multer) to Cloudinary and resolves with the upload result
export const uploadBufferToCloudinary = (buffer, { folder, resourceType = 'image' }) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

// Extracts the Cloudinary public_id from a secure URL and deletes the asset
export const deleteFromCloudinary = (url, resourceType = 'image') => {
  // Strip everything up to and including /upload/(v\d+/)?
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)/);
  if (!match) return Promise.resolve();
  // For raw resources the extension is part of the public_id
  const publicId = resourceType === 'raw' ? match[1] : match[1].replace(/\.[^.]+$/, '');
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export { cloudinary };
