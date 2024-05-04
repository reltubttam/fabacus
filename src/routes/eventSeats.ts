import { Request, Response, NextFunction } from 'express';
import * as redis from '../redis/eventSeats';
import { listFreeSeats, holdSeat, reserveSeat } from '../lib/eventSeats';

// post /events
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

// get /events/:eventId/seats
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

// patch /events/:eventId/seats/:seatId/hold
export async function holdSeatRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, seatId } = req.params;
    const userId = `${req.headers['x-user-id']}`;
    const seat = await holdSeat(eventId, seatId, userId);
    res.status(200).json({
      seat,
      ok: true,
    });
  } catch (error) {
    next(error);
  }
}

// patch /events/:eventId/seats/:seatId/reserve
export async function reserveSeatRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, seatId } = req.params;
    const userId = `${req.headers['x-user-id']}`;
    const seat = await reserveSeat(eventId, seatId, userId);
    res.status(200).json({
      seat,
      ok: true,
    });
  } catch (error) {
    next(error);
  }
}
