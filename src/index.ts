import express from 'express';
import { PORT } from './config';
import {
  userIdValidation,
  createEventValidation,
  holdSeatValidation,
} from './middleware/validation';
import errorHandler from './middleware/errorHandler';
import {
  createEventRoute,
  listSeatsRoute,
  holdSeatRoute,
  reserveSeatRoute,
} from './routes/eventSeats';
import unknownRoute from './routes/unknownRoute';
import redisClient from './redis';

const app = express();

app.use(express.json());
app.use(userIdValidation);

app.post('/events', createEventValidation, createEventRoute);
app.get('/events/:eventId/seats', listSeatsRoute);
app.patch('/events/:eventId/seats/:seatId/hold', holdSeatValidation, holdSeatRoute);
app.patch('/events/:eventId/seats/:seatId/reserve', reserveSeatRoute);
app.use(unknownRoute);

app.use(errorHandler);
const runningApp = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function gracefulShutdown() {
  runningApp.close();
  redisClient.quit();
}
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
