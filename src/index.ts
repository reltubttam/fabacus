import express from 'express';
import { PORT } from './config';
import {
  userIdValidation,
  createEventValidation,
} from './middleware/validation';
import errorHandler from './middleware/errorHandler'
import { createEventRoute } from './routes/eventSeats';
import redisClient from './redis';

const app = express();

app.use(express.json());
app.use(userIdValidation);

app.post('/events', createEventValidation, createEventRoute);

app.use(errorHandler)
const runningApp = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function gracefulShutdown() {
  runningApp.close();
  redisClient.quit();
}
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
