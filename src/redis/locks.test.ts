import {aquireSeatLock, releaseSeatLock} from './locks';
import {LOCK_EXPIRY_MS} from '../config'

const redisClientMock: any = {
  multi: jest.fn(() => redisClientMock),
  set: jest.fn(() => redisClientMock),
  get: jest.fn(() => redisClientMock),
  exec: jest.fn(() => [['_', null], ['_', 'RESULT']]),
  del: jest.fn(() => true),
};

jest.mock('./index', () => {
  return {
    multi: (...args:any[]) => redisClientMock.multi(...args),
    set: (...args:any[]) => redisClientMock.set(...args),
    get: (...args:any[]) => redisClientMock.get(...args),
    exec: (...args:any[]) => redisClientMock.exec(...args),
    del: (...args:any[]) => redisClientMock.del(...args),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('aquireSeatLock', () => {
  it('does not aquire lock if already exists', async () => {
    const result = await aquireSeatLock('ID');
    expect(redisClientMock.multi.mock.calls).toEqual([[]]);
    expect(redisClientMock.set.mock.calls[0][0]).toEqual('SEAT_LOCK_ID');
    expect(redisClientMock.set.mock.calls[0].slice(-3)).toEqual(['PX', LOCK_EXPIRY_MS, 'NX']);
    expect(redisClientMock.get.mock.calls).toEqual([['SEAT_LOCK_ID']]);
    expect(redisClientMock.exec.mock.calls).toEqual([[]]);
    expect(result).toEqual(false);
  });

  it('aquires lock if does not exist', async () => {
    const randomNumber = 1;
    redisClientMock.exec.mockImplementationOnce(() => [['_', 'OK'], ['_', randomNumber]]);
    const realRandom = Math.random;
    Math.random = () => randomNumber;

    const result = await aquireSeatLock('ID');
    expect(redisClientMock.multi.mock.calls).toEqual([[]]);
    expect(redisClientMock.set.mock.calls).toEqual([['SEAT_LOCK_ID', randomNumber, 'PX', LOCK_EXPIRY_MS, 'NX']]);
    expect(redisClientMock.get.mock.calls).toEqual([['SEAT_LOCK_ID']]);
    expect(redisClientMock.exec.mock.calls).toEqual([[]]);
    expect(result).toEqual(true);

    Math.random = realRandom;
  });
});
  
describe('releaseSeatLock', () => {
  it('releases locks', async () => {
    const result = await releaseSeatLock('ID');
    expect(redisClientMock.del.mock.calls).toEqual([['SEAT_LOCK_ID']]);
    expect(result).toEqual(undefined);
  });
});
  