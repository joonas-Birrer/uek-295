// Exportiert einen eigenen Parameter-Dekorator namens @CorrId()
import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { UserRequest } from '../types/user-request';

export const IsAdmin = createParamDecorator(
  // _data: optionale Daten, die man dem Decorator übergeben könnte
  // ctx: ExecutionContext enthält Informationen über den aktuellen Request
  (_data: unknown, ctx: ExecutionContext) => {
    // Zugriff auf das HTTP-Request-Objekt
    // switchToHttp() ist nötig, weil NestJS auch andere Kontexte kennt (z. B. GraphQL, RPC)
    const request: UserRequest = ctx.switchToHttp().getRequest();
    Logger.log('', 'IsAdmin.decorator.ts');
    const user = request.user;
    if (!user) {
      Logger.warn('User not found in request', 'isAdmin.decorator.ts');
      return false;
    } else {
      Logger.log(
        `User found: ${user.username} IsAdmin: ${JSON.stringify(user, null, 2)}`,
        'is-admin.decorator.ts',
      );
    }
    return user.isAdmin;
  },
);
