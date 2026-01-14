import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TodoEntity } from './entities/todo.entity';
import { AuthGuard } from '../auth/auth.guard';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TodoEntity]),
    ConfigModule,
    JwtModule,
    UserModule,
  ],
  controllers: [TodoController],
  providers: [TodoService, AuthGuard],
})
export class TodoModule {}
