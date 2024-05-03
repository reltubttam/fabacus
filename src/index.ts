import express from 'express';
import {
  aquireSeatLock, releaseSeatLock, createEvent, getAllEventSeats, getEventSeat,
  setEventSeat,
} from './redis/eventSeats';

const PORT = process.env.PORT || 1000;

const app = express();

app.use(express.json());

app.get('/foo', async (req, res) => {
  await releaseSeatLock('1');
  const hasLock = await aquireSeatLock('1');
  res.send({ hasLock });
});

app.get('/bar', async (req, res) => {
  const { eventId, seats } = await createEvent(3);
  console.log(eventId, seats);
  const gotSeats = await getAllEventSeats(eventId);

  const oneSeat = await getEventSeat(eventId, gotSeats[0].seatId as string);
  await setEventSeat(eventId, gotSeats[0].seatId as string, { ...oneSeat, foo: 'bar' });
  const oneSeatTwo = await getEventSeat(eventId, gotSeats[0].seatId as string);

  res.send({
    eventId, seats, gotSeats, oneSeat, oneSeatTwo,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
