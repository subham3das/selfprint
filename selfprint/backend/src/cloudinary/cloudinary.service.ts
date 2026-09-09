import { UploadApiResponse, UploadApiOptions } from 'cloudinary';
import { cloudinary } from '../config/cloudinary.config';
import { ApiError } from '../errors/ApiError';
import { HTTP_STATUS } from '../constants/httpStatusCodes';
import { ERROR_CODES } from '../constants/errorCodes';

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  bytes: number;
  width?: number;
  height?: number;
  originalFilename?: string;
}

export class CloudinaryService {
  /**
   * Upload an image buffer or file path to Cloudinary
   */
  public async uploadImage(
    fileBufferOrPath: string | Buffer,
    folder = 'selfprint/images',
    options?: UploadApiOptions
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(fileBufferOrPath, {
      folder,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      ...options
    });
  }

  /**
   * Upload a PDF document to Cloudinary
   */
  public async uploadPDF(
    fileBufferOrPath: string | Buffer,
    folder = 'selfprint/pdfs',
    options?: UploadApiOptions
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(fileBufferOrPath, {
      folder,
      resource_type: 'auto',
      allowed_formats: ['pdf'],
      ...options
    });
  }

  /**
   * Upload a general document / asset (DOCX, PPT, XLSX, Text) to Cloudinary
   */
  public async uploadDocument(
    fileBufferOrPath: string | Buffer,
    folder = 'selfprint/documents',
    options?: UploadApiOptions
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(fileBufferOrPath, {
      folder,
      resource_type: 'auto',
      ...options
    });
  }

  /**
   * Delete an uploaded asset from Cloudinary by public ID
   */
  public async deleteFile(
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'image'
  ): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      return result.result === 'ok' || result.result === 'not found';
    } catch (error: any) {
      throw new ApiError(
        `Failed to delete asset from Cloudinary: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.CLOUDINARY_ERROR,
        error
      );
    }
  }

  /**
   * Replace an existing file in Cloudinary with a new one
   */
  public async replaceFile(
    oldPublicId: string | null | undefined,
    newFile: string | Buffer,
    folder: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'image'
  ): Promise<CloudinaryUploadResult> {
    if (oldPublicId) {
      await this.deleteFile(oldPublicId, resourceType).catch((err) => {
        console.warn(`Could not delete previous file ${oldPublicId}:`, err);
      });
    }

    if (resourceType === 'image') {
      return this.uploadImage(newFile, folder);
    }
    return this.uploadDocument(newFile, folder);
  }

  /**
   * Core upload handler supporting Base64, remote URLs, file paths and buffer streams
   */
  private async uploadFile(
    file: string | Buffer,
    options: UploadApiOptions
  ): Promise<CloudinaryUploadResult> {
    try {
      return new Promise<CloudinaryUploadResult>((resolve, reject) => {
        if (typeof file === 'string') {
          cloudinary.uploader.upload(file, options, (error, result) => {
            if (error || !result) {
              return reject(
                new ApiError(
                  `Cloudinary upload error: ${error?.message || 'Unknown error'}`,
                  HTTP_STATUS.BAD_REQUEST,
                  ERROR_CODES.CLOUDINARY_ERROR,
                  error
                )
              );
            }
            resolve(this.formatUploadResult(result));
          });
        } else {
          const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
              if (error || !result) {
                return reject(
                  new ApiError(
                    `Cloudinary stream upload error: ${error?.message || 'Unknown error'}`,
                    HTTP_STATUS.BAD_REQUEST,
                    ERROR_CODES.CLOUDINARY_ERROR,
                    error
                  )
                );
              }
              resolve(this.formatUploadResult(result));
            }
          );
          uploadStream.end(file);
        }
      });
    } catch (error: any) {
      throw new ApiError(
        `Cloudinary operation failed: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.CLOUDINARY_ERROR,
        error
      );
    }
  }

  private formatUploadResult(result: UploadApiResponse): CloudinaryUploadResult {
    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      originalFilename: result.original_filename
    };
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
