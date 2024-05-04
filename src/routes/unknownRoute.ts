import { Request, Response } from 'express';

export default async function unknownRoute(req: Request, res: Response) {
  res.status(404).json({
    message: `unknown route ${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}}`,
    ok: false,
  });
}
