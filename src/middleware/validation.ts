import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function userIdValidation(req: Request, res: Response, next: NextFunction) {
  if (!req.headers || !req.headers['x-user-id']) {
    next(new Error('x-user-id required in headers'));
  }
  next();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createEventValidation(req: Request, res: Response, next: NextFunction) {
  if (!req.body || !req.body.numSeats || parseInt(req.body.numSeats, 10) !== req.body.numSeats) {
    next(new Error('numSeats integer required in body'));
  }
  if (req.body.numSeats < 10 || req.body.numSeats > 1000) {
    next(new Error('numSeats must be between 10 & 1000 inclusive'));
  }
  next();
}
