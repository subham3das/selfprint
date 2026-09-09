import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { BaseController } from '../../controllers/BaseController';
import { publicService, PublicService } from './public.service';
import { countPdfPagesFromBuffer, countPdfPagesFromFile } from '../../utils/pdfCounter';
import { ApiResponse } from '../../responses/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatusCodes';

export class PublicController extends BaseController {
  private service: PublicService;

  constructor(service: PublicService = publicService) {
    super();
    this.service = service;
  }

  public getStore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const identifier = req.params.identifier;
      const qrToken = (req.query.qr as string) || undefined;
      const result = await this.service.getPublicStore(identifier, qrToken);

      if (!result.available) {
        ApiResponse.error(
          res,
          result.message || 'Store or QR unavailable',
          result.statusReason === 'EXPIRED_QR' ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.NOT_FOUND
        );
        return;
      }

      this.sendSuccess(res, 'Store details loaded successfully', result);
    } catch (error) {
      next(error);
    }
  };

  public calculatePrice = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const calculation = await this.service.calculatePrice(req.body);
      this.sendSuccess(res, 'Price calculated successfully', calculation);
    } catch (error) {
      next(error);
    }
  };

  public uploadDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        ApiResponse.error(res, 'No file uploaded. Please select a valid document.', HTTP_STATUS.BAD_REQUEST);
        return;
      }

      let totalPages = 1;
      const ext = path.extname(file.originalname).replace('.', '').toLowerCase();

      if (ext === 'pdf' || file.mimetype === 'application/pdf') {
        if (file.buffer) {
          totalPages = countPdfPagesFromBuffer(file.buffer);
        } else if (file.path) {
          totalPages = countPdfPagesFromFile(file.path);
        }
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        totalPages = 1;
      } else if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
        totalPages = 1;
      }

      const formattedSize =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      const fileUrl =
        (file as any).path ||
        (file as any).secure_url ||
        `/uploads/${file.filename || file.originalname}`;

      const uploadedFileInfo = {
        id: file.filename || `doc-${Date.now()}`,
        name: file.originalname,
        size: file.size,
        formattedSize,
        type: file.mimetype,
        extension: ext,
        totalPages: Math.max(1, totalPages),
        fileUrl,
        previewUrl: fileUrl
      };

      this.sendSuccess(res, 'Document uploaded & analyzed successfully', {
        success: true,
        documentId: uploadedFileInfo.id,
        pages: uploadedFileInfo.totalPages,
        fileSize: uploadedFileInfo.size,
        preview: uploadedFileInfo.previewUrl,
        supported: true,
        file: uploadedFileInfo
      });
    } catch (error) {
      next(error);
    }
  };
}

export const publicController = new PublicController();
export default publicController;
