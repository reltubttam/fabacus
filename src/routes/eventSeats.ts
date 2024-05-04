import { Request, Response, NextFunction } from 'express';
import * as redis from '../redis/eventSeats';
import { listFreeSeats } from '../lib/eventSeats';

export async function createEventRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const { numSeats } = req.body;
    const { eventId, seats } = await redis.createEvent(numSeats);
    res.status(200).json({
      eventId,
      seats,
      ok: true,
    });
  } catch (error) {
    next(error);
  }
}

export async function listSeatsRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params;
    const seats = await listFreeSeats(eventId);
    res.status(200).json({
      seats,
      ok: true,
    });
  } catch (error) {
    next(error);
  }
}
