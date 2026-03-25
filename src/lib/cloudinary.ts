import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;


/**
 * Uploads a file to Cloudinary using unsigned upload.
 * Note: You need to enable 'Unsigned uploading' in Cloudinary Settings -> Upload -> Upload Presets
 */
export const uploadToCloudinary = async (
  file: File | Blob, 
  onProgress?: (percent: number) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'focal_knot_unsigned');

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      }
    );

    return response.data.secure_url;
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error.response?.data || error.message);
    throw new Error('Failed to upload image. Please try again.');
  }
};
