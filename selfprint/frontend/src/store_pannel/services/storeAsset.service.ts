import { apiClient } from '@/lib/axios';

export interface AssetUploadResponse {
  url: string;
  publicId: string;
}

export const storeAssetService = {
  /**
   * Upload an image to Cloudinary via backend multipart endpoint
   */
  async uploadStoreImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: AssetUploadResponse;
    }>('/store/upload-asset', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.data.url;
  }
};

export default storeAssetService;
