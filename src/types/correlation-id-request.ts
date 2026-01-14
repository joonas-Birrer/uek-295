// src/types/correlation-id-request.ts
import { Request } from 'express';
export type CorrelationIdRequest = Request & { correlationId: number };
