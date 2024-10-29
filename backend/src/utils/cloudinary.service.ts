import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';

const uploadOnCloudinary = async (localFilePath: string): Promise<string> => {
  // cloudinary config
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.CLOUD_API_KEY as string,
    api_secret: process.env.CLOUD_API_SECRET as string,
  });

  try {
    // file upload with resizing
    const uploadResult: UploadApiResponse = await cloudinary.uploader
    .upload(localFilePath, {
      resource_type: 'image',
      transformation: {
        width: 64,  // Resize to a width of 64px
        height: 64, // Resize to a height of 64px
        crop: 'limit', // Crop the image to fit within the 64x64 size
      }
    });

    // Delete the local file after upload
    fs.unlinkSync(localFilePath);

    // Return the secure URL
    return uploadResult.secure_url;
  } catch (error) {
    // Delete the file in case of an error
    fs.unlinkSync(localFilePath);
    console.error('Error while uploading to Cloudinary:', error);
    throw error;
  }
};

export { uploadOnCloudinary };
