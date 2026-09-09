import { Router } from 'express';
import multer from 'multer';
import { publicController } from './public.controller';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max limit
  }
});

const publicRouter = Router();

// 1. Get Store public configuration & pre-flight hardware availability
publicRouter.get('/store/:identifier', publicController.getStore);

// 2. Server-side price calculation (Zero frontend calculations)
publicRouter.post('/calculate-price', publicController.calculatePrice);

// 3. Document upload & page count extraction
publicRouter.post('/upload', upload.single('file'), publicController.uploadDocument);

export default publicRouter;
export { publicRouter };
