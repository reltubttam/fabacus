import { Request, Response, NextFunction } from 'express';
import * as redis from '../redis/eventSeats';

export async function createEventRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const { NumSeats } = req.body;
    const { eventId, seats } = await redis.createEvent(NumSeats);
    res.status(200).json({
      eventId,
      seats,
      ok: true,
    });
  } catch (error) {
    next(error);
  }
}
