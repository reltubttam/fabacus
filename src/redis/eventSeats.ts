import * as uuid from 'uuid';
import client from './index';

export interface Seat {
  seatId: string;
  status: 'free' | 'reserved';
  userId?: string;
  heldUntil?: number;
}

export async function createEvent(numSeats: number) {
  const eventId = uuid.v4();
  const seats:{ [seatId:string]: string } = {};

  let seatNumber = 0;
  while (seatNumber < numSeats) {
    const seatId = uuid.v4();
    seats[seatId] = JSON.stringify({
      seatId,
      status: 'free',
    });
    seatNumber += 1;
  }
  await client.hset(`EVENT_${eventId}`, seats);
  return {
    eventId,
    seats: Object.values(seats).map((seatJson) => JSON.parse(seatJson)),
  };
}

export async function getAllEventSeats(id: string) {
  const seatsHash = await client.hgetall(`EVENT_${id}`);
  const seats: Seat[] = Object.values(seatsHash).map((seatJson) => JSON.parse(seatJson));
  return seats;
}

export async function getEventSeat(eventId: string, seatId: string) {
  const seatJson = await client.hget(`EVENT_${eventId}`, seatId);
  if (!seatJson) throw new Error('no seat found');
  const seat:Seat = JSON.parse(seatJson);
  return seat;
}

export async function setEventSeat(eventId: string, seatId: string, seat: Seat) {
  await client.hset(`EVENT_${eventId}`, seatId, JSON.stringify(seat));
}
