import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { PasswordService } from './user/password.service';
import { UserEntity } from './user/entities/user.entity';
import { correlationIdMiddleware, loggerMiddleware } from './middlewares';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(correlationIdMiddleware);
  app.use(loggerMiddleware);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const configService = app.get<ConfigService>(ConfigService);

  const port = configService.get<number>('PORT') || 3001;
  const swaggerTitle = configService.get<string>('SWAGGER_TITLE') || 'Example';
  const swaggerVersion = configService.get<string>('SWAGGER_VERSION') || '1.0';
  const swaggerDocPath =
    configService.get<string>('SWAGGER_DOC_PATH') || 'docs';

  const authorName =
    configService.get<string>('SWAGGER_AUTHOR_NAME') || 'Kursleiter';
  const authorEmail =
    configService.get<string>('SWAGGER_AUTHOR_EMAIL') || 'coach@ict-uek.ch';
  const authorUrl =
    configService.get<string>('SWAGGER_AUTHOR_URL') ||
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  const config = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setContact(authorName, authorUrl, authorEmail)
    .setVersion(swaggerVersion)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerDocPath, app, document);

  await app.listen(port);

  Logger.log(`NEST application successfully started`, bootstrap.name);
  Logger.debug(
    `Server in version: ${swaggerVersion} ist jetzt erreichbar unter http://localhost:${port}`,
    bootstrap.name,
  );
  Logger.debug(
    `Swagger ist jetzt erreichbar unter http://localhost:${port}/${swaggerDocPath}`,
    bootstrap.name,
  );

  return app;
}
bootstrap()
  .then(async (app: INestApplication) => {
    await initialUserLoad(app);
    Logger.log(`Server ist up and running`, 'bootstrap.then');
  })
  .catch((err) => console.error(err));
async function initialUserLoad(app: INestApplication) {
  const passwordService = app.get<PasswordService>(PasswordService);
  const dataSource = app.get(DataSource);
  const userRepo = dataSource.getRepository(UserEntity);
  Logger.debug('initialUserLoad: start', initialUserLoad.name);
  await userRepoUpdate(passwordService, userRepo, 1, 'admin', true);
  await userRepoUpdate(passwordService, userRepo, 2, 'user', false);
  Logger.debug('initialUserLoad: end', initialUserLoad.name);
}
async function userRepoUpdate(
  passwordService: PasswordService,
  userRepo: Repository<UserEntity>,
  id: number,
  username: string,
  isAdmin: boolean,
  password: string = username,
) {
  Logger.verbose(
    `userRepoUpdate: id=${id}, username=${username}, isAdmin=${isAdmin}, password=${password}`,
    userRepoUpdate.name,
  );
  await userRepo.upsert(
    {
      id,
      username: username.toLowerCase(),
      email: `${username}@local.ch`.toLowerCase(),
      isAdmin: isAdmin ?? false,
      passwordHash: await passwordService.hashPassword(
        password ? password : username,
      ),
    },
    ['id'],
  );
}
