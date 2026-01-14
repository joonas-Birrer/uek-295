// src/decorators/user.decorator.ts
// Importiert Hilfsfunktionen aus NestJS, um eigene Parameter-Dekoratoren zu erstellen
import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
// Eigener Typ für das Request-Objekt,
// der z. B. um `user` erweitert wurde
import { UserRequest } from '../types/user-request';
// Exportiert einen eigenen Parameter-Dekorator namens @CorrId()
export const User = createParamDecorator(
  // _data: optionale Daten, die man dem Decorator übergeben könnte
  // ctx: ExecutionContext enthält Informationen über den aktuellen Request
  (_data: unknown, ctx: ExecutionContext) => {
    // Zugriff auf das HTTP-Request-Objekt
    // switchToHttp() ist nötig, weil NestJS auch andere Kontexte kennt (z. B. GraphQL, RPC)
    const request: UserRequest = ctx.switchToHttp().getRequest();
    Logger.log('', 'user.decorator.ts');
    const user = request.user;
    if (!user) {
      Logger.warn('User not found in request', 'user.decorator.ts');
    } else {
      Logger.log(
        `User found: ${user.username} user: ${JSON.stringify(user, null, 2)}`,
        'user.decorator.ts',
      );
    }
    return user;
  },
);
