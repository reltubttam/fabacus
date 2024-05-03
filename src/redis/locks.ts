import { LOCK_EXPIRY_MS } from '../config';
import client from './index';

export async function aquireSeatLock(id: string) {
  const randomId = Math.random();
  const [[, error], [, result]] = await client
    .multi()
    .set(`SEAT_LOCK_${id}`, randomId, 'PX', LOCK_EXPIRY_MS, 'NX')
    .get(`SEAT_LOCK_${id}`)
    .exec() || [];

  if (error !== 'OK' || result !== randomId) {
    return false;
  }
  return true;
}

export async function releaseSeatLock(id: string) {
  await client.del(`SEAT_LOCK_${id}`);
}
