import { Request, Response, NextFunction } from 'express';
import { getAllEventSeats } from '../redis/eventSeats';
import { MAX_EVENT_SEATS_PER_USER } from '../config';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function holdSeatValidation(req: Request, res: Response, next: NextFunction) {
  try {
    const seats = await getAllEventSeats(req.params.eventId);
    const userSeats = seats.filter(({
      status,
      userId,
      heldUntil,
      seatId,
    }) => {
      if (userId === req.headers['x-user-id'] && status === 'reserved') {
        return true;
      }
      if (userId === req.headers['x-user-id']
        && seatId !== req.params.seatId
        && heldUntil
        && heldUntil > Date.now()
      ) {
        return true;
      }
      return false;
    });

    if (userSeats.length >= MAX_EVENT_SEATS_PER_USER) {
      next(new Error(`limit of ${MAX_EVENT_SEATS_PER_USER} seats per event reached by user`));
    }
    next();
  } catch (error) {
    next(error);
  }
}
