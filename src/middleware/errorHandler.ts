import { Request, Response, NextFunction } from 'express';

export default function (err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err.message);

  res.status(500).send({
    message: err.message,
    ok: false,
  });
}