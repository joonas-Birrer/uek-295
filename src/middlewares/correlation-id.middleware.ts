import { Response, NextFunction } from 'express';
import { CorrelationIdRequest } from '../types/correlation-id-request';
import { randomInt } from 'node:crypto';

export function correlationIdMiddleware(
  req: CorrelationIdRequest,
  _res: Response,
  next: NextFunction,
) {
  if (!req.correlationId) {
    req.correlationId = randomInt(10000, 99999);
  }
  next();
}
