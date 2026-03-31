import { Request, Response, NextFunction } from 'express';

export const limiter = (req: Request, res: Response, next: NextFunction) => {
  next();
};