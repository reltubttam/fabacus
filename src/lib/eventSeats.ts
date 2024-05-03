import {
  getAllEventSeats, getEventSeat, setEventSeat, Seat,
} from '../redis/eventSeats';
import { aquireSeatLock, releaseSeatLock } from '../redis/locks';
import { HOLD_EXPIRY_MS } from '../config';

export async function listFreeSeats(eventId: string) {
  const seats = await getAllEventSeats(eventId);
  return seats.filter(({ status, heldUntil }) => {
    if (status !== 'free') {
      return false;
    }
    if (heldUntil && heldUntil > Date.now()) {
      return false;
    }
    return true;
  });
}

export async function holdSeat(eventId: string, seatId: string, userId: string) {
  const lockAquired = aquireSeatLock(seatId);
  if (!lockAquired) {
    throw new Error('seat locked');
  }

  const seat = await getEventSeat(eventId, seatId);
  if (!seat || seat.status !== 'free') {
    throw new Error('seat unavailable');
  }
  if (seat.userId !== userId && seat.heldUntil && seat.heldUntil > Date.now()) {
    throw new Error('seat unavailable');
  }

  const newSeat:Seat = {
    ...seat,
    heldUntil: Date.now() + HOLD_EXPIRY_MS,
    userId,
  };
  await setEventSeat(eventId, seatId, newSeat);
  await releaseSeatLock(seatId);
  return newSeat;
}

export async function reserveSeat(eventId: string, seatId: string, userId: string) {
  const seat = await getEventSeat(eventId, seatId);
  if (!seat || seat.status !== 'free' || seat.userId !== userId) {
    throw new Error('seat unavailable');
  }

  const newSeat:Seat = {
    ...seat,
    status: 'reserved',
    heldUntil: undefined,
    userId,
  };
  await setEventSeat(eventId, seatId, newSeat);
  return newSeat;
}
