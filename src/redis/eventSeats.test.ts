import {
  createEvent,
  getAllEventSeats,
  getEventSeat,
  setEventSeat,
  Seat,
} from './eventSeats';

const redisClientMock: any = {
  hset: jest.fn(),
  hgetall: jest.fn(() => ({
    ID1: JSON.stringify({
      seatId: 'ID1',
      status: 'free',
    }),
    ID2: JSON.stringify({
      seatId: 'ID2',
      status: 'reserved',
    }),
  })),
  hget: jest.fn((_eventId, seatId) => JSON.stringify({
    seatId,
    status: 'free',
  })),
};
jest.mock('./index', () => {
  return {
    hset: (...args:any[]) => redisClientMock.hset(...args),
    hgetall: (...args:any[]) => redisClientMock.hgetall(...args),
    hget: (...args:any[]) => redisClientMock.hget(...args),
  };
});

const uuidMock = jest.fn()
jest.mock('uuid', () => {
  return {
    v4: (...args:any[]) => uuidMock(...args)
  };
});

afterEach(() => {
  jest.clearAllMocks();
});
  
describe('createEvent', () => {
  it('creates events', async () => {

    let uuidCount = 0;
    uuidMock.mockImplementation(() => {
      uuidCount = uuidCount + 1;
      return `UUID_${uuidCount}`;
    })
    const result = await createEvent(2);
    expect(result).toEqual({
      eventId: 'UUID_1',
      seats: [
        {
          seatId: 'UUID_2',
          status: 'free',
        },
        {
          seatId: 'UUID_3',
          status: 'free',
        }
      ]
    });
  });
});

describe('getAllEventSeats', () => {
  it('gets all seats at an event, including reserved', async () => {
    const result = await getAllEventSeats('ID');
    expect(redisClientMock.hgetall.mock.calls).toEqual([['EVENT_ID']]);
    expect(result).toEqual([
      {
        seatId: 'ID1',
        status: 'free',
      },
      {
        seatId: 'ID2',
        status: 'reserved',
      },
    ]);
  });
});
  
describe('getEventSeat', () => {
  it('gets all seats at an event, including reserved', async () => {
    const result = await getEventSeat('EVENT_ID', 'SEAT_ID');
    expect(redisClientMock.hget.mock.calls).toEqual([['EVENT_EVENT_ID', 'SEAT_ID']]);
    expect(result).toEqual({
        seatId: 'SEAT_ID',
        status: 'free',
      });
  });
});

describe('setEventSeat', () => {
  it('gets all seats at an event, including reserved', async () => {
    const seat:Seat = {
      seatId: 'SEAT_ID',
      status: "free",
    };
    const result = await setEventSeat('EVENT_ID', 'SEAT_ID', seat);
    expect(redisClientMock.hset.mock.calls).toEqual([['EVENT_EVENT_ID', 'SEAT_ID', JSON.stringify(seat)]]);
    expect(result).toEqual(undefined);
  });
});
  