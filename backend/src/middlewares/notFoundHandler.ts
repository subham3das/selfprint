import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors';

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  next(
    new NotFoundError(
      `Route not found on Self Print Server: [${req.method}] ${req.originalUrl}`
    )
  );
};

export default notFoundHandler;
