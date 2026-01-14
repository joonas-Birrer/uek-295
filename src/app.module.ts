// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TodoModule } from './article/todo.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<'sqlite'>('DB_TYPE', 'sqlite'),
        database: configService.get<string>('DB_DATABASE', 'data/app.db'), // Pfad zur SQLite-Datei
        entities: [],
        autoLoadEntities: true,
        synchronize: true, // DEV ok, PROD besser mit Migrations
        logging: false,
      }),
    }),
    TodoModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}
