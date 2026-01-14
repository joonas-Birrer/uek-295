import { Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';
import { CorrelationIdRequest } from '../types/correlation-id-request';

export function loggerMiddleware(
  req: CorrelationIdRequest,
  _res: Response,
  next: NextFunction,
) {
  Logger.log(
    `${req.correlationId} ${req.method} ${req.url} from ${req.ip}`,
    loggerMiddleware.name,
  );
  next();
}
