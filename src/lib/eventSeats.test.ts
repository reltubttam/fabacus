import {listFreeSeats, holdSeat, reserveSeat} from './eventSeats'
import {HOLD_EXPIRY_MS} from '../config'

const EXAMPLE_SEATS = [
  {
    seatId: 'UUID_1',
    status: 'free',
  },
  {
    seatId: 'UUID_2',
    status: 'free',
    heldUntil: Date.now() - 24*60*60*1000
  },
  {
    seatId: 'UUID_3',
    status: 'free',
    heldUntil: Date.now() + 24*60*60*1000
  },
  {
    seatId: 'UUID_4',
    status: 'reserved',
  }
]
const getAllEventSeatsMock = jest.fn((...args) => EXAMPLE_SEATS)
const getEventSeatMock = jest.fn((...args) => EXAMPLE_SEATS[0])
const setEventSeatMock = jest.fn((...args) => undefined)
jest.mock('../redis/eventSeats', () => {
  return {
    getAllEventSeats: (...args:any[]) => getAllEventSeatsMock(...args),
    getEventSeat:  (...args:any[]) => getEventSeatMock(...args),
    setEventSeat: (...args:any[]) => setEventSeatMock(...args),
  };
});

const aquireSeatLockMock = jest.fn((...args) => true)
const releaseSeatLockMock = jest.fn((...args) => undefined)
jest.mock('../redis/locks', () => {
  return {
    aquireSeatLock: (...args:any[]) => aquireSeatLockMock(...args),
    releaseSeatLock:  (...args:any[]) => releaseSeatLockMock(...args),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('listFreeSeats', () => {
  it('lists publicly exposed seats', async () => {
    const result = await listFreeSeats('EVENT_ID')
    expect(getAllEventSeatsMock.mock.calls).toEqual([['EVENT_ID']])
    expect(result).toEqual([EXAMPLE_SEATS[0], EXAMPLE_SEATS[1]])
  });
});

describe('holdSeat', () => {
  it('sets valid heldUntil', async () => {
    getEventSeatMock.mockImplementation(() => ({
      seatId: 'SEAT_ID',
      status: 'free',
    }));
    const staticNow = 1714700000000;
    const realNow = Date.now;
    Date.now = () => staticNow;

    const result = await holdSeat('EVENT_ID', 'SEAT_ID', 'USER_ID')
    expect(aquireSeatLockMock.mock.calls).toEqual([['SEAT_ID']]);
    expect(getEventSeatMock.mock.calls).toEqual([['EVENT_ID', 'SEAT_ID']]);
    expect(setEventSeatMock.mock.calls).toEqual([['EVENT_ID', 'SEAT_ID', {
      seatId: 'SEAT_ID',
      userId: 'USER_ID',
      status: 'free',
      heldUntil: staticNow + HOLD_EXPIRY_MS,
    },]]);
    expect(releaseSeatLockMock.mock.calls).toEqual([['SEAT_ID']]);
    expect(result).toEqual({
      seatId: 'SEAT_ID',
      userId: 'USER_ID',
      status: 'free',
      heldUntil: staticNow + HOLD_EXPIRY_MS,
    })

    Date.now = realNow;
  });
});

describe('reserveSeat', () => {
  it('reserves valid seat', async () => {
    const heldUntil = Date.now() + 24*60*60*1000;
    getEventSeatMock.mockImplementation(() => ({
      seatId: 'SEAT_ID',
      userId: 'USER_ID',
      status: 'free',
      heldUntil,
    }));

    const result = await reserveSeat('EVENT_ID', 'SEAT_ID', 'USER_ID')
    expect(getEventSeatMock.mock.calls).toEqual([['EVENT_ID', 'SEAT_ID']]);
    expect(setEventSeatMock.mock.calls).toEqual([['EVENT_ID', 'SEAT_ID', {
      seatId: 'SEAT_ID',
      userId: 'USER_ID',
      status: 'reserved',
    },]]);
    expect(result).toEqual({
      seatId: 'SEAT_ID',
      userId: 'USER_ID',
      status: 'reserved',
    })
  });
});