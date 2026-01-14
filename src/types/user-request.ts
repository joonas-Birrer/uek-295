import { CorrelationIdRequest } from './correlation-id-request';
import { ReturnUserDto } from '../user/dto';

export type UserRequest = CorrelationIdRequest & { user: ReturnUserDto };
