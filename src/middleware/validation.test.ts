import {createEventValidation, userIdValidation, holdSeatValidation} from './validation';
import { Request, Response, NextFunction } from 'express';

const getAllEventSeatsMock = jest.fn()
jest.mock('../redis/eventSeats', () => {
  return {
    getAllEventSeats: (...args:any[]) => getAllEventSeatsMock(...args),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('userIdValidation', () => {
  it('expects x-user-id in headers', async () => {
    const next = jest.fn();
    userIdValidation(
      {headers: {'x-user-id': undefined}} as any as Request, 
      null as any as Response, 
      next
    );
    expect(next.mock.calls[0][0].message).toEqual('x-user-id required in headers');
  });
  it('accepts valid x-user-id', async () => {
    const next = jest.fn();
    userIdValidation(
      {headers: {'x-user-id': '550e8400-e29b-41d4-a716-446655440000'}} as any as Request, 
      null as any as Response, 
      next
    );
    expect(next.mock.calls).toEqual([[]]);
  });
});

describe('createEventValidation', () => {
  it('expects integer numSeats in body', async () => {
    const next = jest.fn();
    createEventValidation(
      {body: {numSeats: 3.14159}} as any as Request, 
      null as any as Response, 
      next
    );
    expect(next.mock.calls[0][0].message).toEqual('numSeats integer required in body');
  });
  it('expects numSeats in valid range', async () => {
    const next = jest.fn();
    createEventValidation(
      {body: {numSeats: 314159}} as any as Request, 
      null as any as Response, 
      next
    );
    expect(next.mock.calls[0][0].message).toEqual('numSeats must be between 10 & 1000 inclusive');
  });
  it('accepts valid numSeats', async () => {
    const next = jest.fn();
    createEventValidation(
      {body: {numSeats: 314}} as any as Request, 
      null as any as Response, 
      next
    );
    expect(next.mock.calls).toEqual([[]]);
  });
});

describe('holdSeatValidation', () => {
  it('disallows if user holds too many seats', async () => {
    const req:Request = {
      headers: {
        'x-user-id': 'foo'
      },
      params: {
        eventId: "EVENT_ID",
        seatId: "SEAT_ID",
      }
    } as any
    const next = jest.fn();
    getAllEventSeatsMock.mockImplementation(() => ([
      {
        "seatId": "OTHER_EVENT_ID",
        "status": "reserved",
        "userId": "foo"
      },
      {
        "seatId": "OTHER_EVENT_ID",
        "status": "reserved",
        "userId": "foo"
      },
      {
        "seatId": "OTHER_EVENT_ID",
        "status": "reserved",
        "userId": "foo"
      },
    ]))
    await holdSeatValidation(
      req, 
      null as any as Response, 
      next
    );
    expect(next.mock.calls[0][0].message).toEqual('limit of 3 seats per event reached by user');
  });

  it('disallows if user holds too many seats', async () => {
    const req:Request = {
      headers: {
        'x-user-id': 'foo'
      },
      params: {
        eventId: "EVENT_ID",
        seatId: "SEAT_ID",
      }
    } as any
    const next = jest.fn();
    getAllEventSeatsMock.mockImplementation(() => ([
      {
        "seatId": "OTHER_EVENT_ID",
        "status": "reserved",
        "userId": "foo"
      },
      {
        "seatId": "OTHER_EVENT_ID",
        "status": "reserved",
        "userId": "foo"
      },
    ]))
    await holdSeatValidation(
      req, 
      null as any as Response, 
      next
    );
    expect(next.mock.calls).toEqual([[]]);
  });
});
