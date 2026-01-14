// src/middlewares/correlation-id.middleware.ts
import { Response, NextFunction } from 'express';
import { CorrelationIdRequest } from '../types/correlation-id-request';
import { randomInt } from '../lib/random.util.ts';

export function correlationIdMiddleware(
  req: CorrelationIdRequest,
  // Response wird nicht benötigt. Um den Linter zu "überlisten", kannst du einfach ein _ einfügen
  _res: Response,
  next: NextFunction,
) {
  if (!req.correlationId) {
    req.correlationId = randomInt(10000, 99999);
  }
  next();
}
