// Exportiert einen eigenen Parameter-Dekorator namens @CorrId()
import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { UserRequest } from '../types/user-request';

export const UserId = createParamDecorator(
  // _data: optionale Daten, die man dem Decorator übergeben könnte
  // ctx: ExecutionContext enthält Informationen über den aktuellen Request
  (_data: unknown, ctx: ExecutionContext) => {
    // Zugriff auf das HTTP-Request-Objekt
    // switchToHttp() ist nötig, weil NestJS auch andere Kontexte kennt (z. B. GraphQL, RPC)
    const request: UserRequest = ctx.switchToHttp().getRequest();
    Logger.log('', 'UserId.decorator.ts');
    const user = request.user;
    if (!user) {
      Logger.warn('User not found in request', 'UserId.decorator.ts');
    } else {
      Logger.log(
        `User found: ${user.username} UserId: ${JSON.stringify(user, null, 2)}`,
        'is-UserId.decorator.ts',
      );
    }
    return user.id;
  },
);
