import errorHandler from './errorHandler';
import { Request, Response, NextFunction } from 'express';

describe('errorHandler', () => {
  it('responds with errors', async () => {
    const realConsoleError = console.error;
    console.error = () => {};

    const errorMessage = 'something went wrong';
    const json = jest.fn();
    const status = jest.fn(() => ({json}));
    errorHandler(
      new Error(errorMessage), 
      null as any as Request, 
      {status} as any as Response, 
      null as any as NextFunction
    );
    expect(status.mock.calls).toEqual([[500]])
    expect(json.mock.calls).toEqual([[{
      message: errorMessage,
      ok: false,
    }]]);

    console.error = realConsoleError;
  });
});