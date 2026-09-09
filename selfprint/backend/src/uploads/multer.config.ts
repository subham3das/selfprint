import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { BadRequestError } from '../errors';

// Use memory storage so files can be piped directly into Cloudinary
const storage = multer.memoryStorage();

const imageMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml'
];

const documentMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Invalid file type: ${file.mimetype}. Supported image formats: JPG, PNG, WEBP, SVG.`
      )
    );
  }
};

const pdfAndDocumentFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    imageMimeTypes.includes(file.mimetype) ||
    documentMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        `Unsupported document format: ${file.mimetype}. Supported formats: PDF, DOCX, XLSX, TXT, Images.`
      )
    );
  }
};

export const uploadSingleImage = (fieldName = 'image') =>
  multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: imageFileFilter
  }).single(fieldName);

export const uploadMultipleImages = (fieldName = 'images', maxCount = 5) =>
  multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFileFilter
  }).array(fieldName, maxCount);

export const uploadSinglePDF = (fieldName = 'file') =>
  multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: pdfAndDocumentFilter
  }).single(fieldName);

export const uploadAnyDocument = (fieldName = 'document') =>
  multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: pdfAndDocumentFilter
  }).single(fieldName);
