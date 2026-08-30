import { CloudinaryUploadResult } from '../cloudinary/cloudinary.service';

export interface IFileStorageService {
  uploadImage(
    file: string | Buffer,
    folder?: string,
    options?: any
  ): Promise<CloudinaryUploadResult>;

  uploadPDF(
    file: string | Buffer,
    folder?: string,
    options?: any
  ): Promise<CloudinaryUploadResult>;

  uploadDocument(
    file: string | Buffer,
    folder?: string,
    options?: any
  ): Promise<CloudinaryUploadResult>;

  deleteFile(publicId: string, resourceType?: string): Promise<boolean>;

  replaceFile(
    oldPublicId: string | null | undefined,
    newFile: string | Buffer,
    folder: string,
    resourceType?: string
  ): Promise<CloudinaryUploadResult>;
}
