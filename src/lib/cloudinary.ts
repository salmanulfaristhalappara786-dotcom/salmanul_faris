import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'salmanulfaris_unsigned';

export const uploadToCloudinary = async (
  file: File | Blob, 
  onProgress?: (percent: number) => void
): Promise<string> => {
  if (!CLOUD_NAME) {
    console.error('Cloudinary Cloud Name is missing in environment variables!');
    throw new Error('Cloudinary configuration error. Check VITE_CLOUDINARY_CLOUD_NAME.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
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
