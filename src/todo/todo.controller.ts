import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { UpdateTodoAdminDto } from './dto/update-todo-admin.dto';
import { ReturnTodoDto } from './dto/return-todo.dto';

import { AuthGuard } from '../auth/auth.guard';
import { CorrId, IsAdmin, UserId } from '../decorators';

@ApiTags('todo')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @ApiCreatedResponse({ type: ReturnTodoDto })
  @ApiBody({ type: CreateTodoDto })
  create(
    @CorrId() corrId: number,
    @Body() dto: CreateTodoDto,
    @UserId() userId: number,
  ) {
    return this.todoService.create(dto, userId);
  }

  @Get()
  @ApiOkResponse({ type: ReturnTodoDto, isArray: true })
  async findAll(
    @CorrId() corrId: number,
    @IsAdmin() isAdmin: boolean,
    @UserId() userId: number,
  ) {
    if (!isAdmin) {
      return this.todoService.findAll(userId, false);
    }

    return this.todoService.findAll(userId, true);
  }

  @Get(':id')
  @ApiOkResponse({ type: ReturnTodoDto })
  async findOne(
    @CorrId() corrId: number,
    @Param('id', ParseIntPipe) id: number,
    @IsAdmin() isAdmin: boolean,
    @UserId() userId: number,
  ) {
    const todo = await this.todoService.findOne(id, userId, isAdmin);

    if (!isAdmin && todo.createdById !== userId) {
      throw new ForbiddenException('You can only access your own todos');
    }

    return todo;
  }

  @Patch(':id')
  @ApiOkResponse({ type: ReturnTodoDto })
  async update(
    @CorrId() corrId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoDto,
    @IsAdmin() isAdmin: boolean,
    @UserId() userId: number,
  ) {
    if (isAdmin) {
      const adminDto: UpdateTodoAdminDto = { isClosed: dto.isClosed };
      return this.todoService.updateAdmin(id, adminDto, userId);
    }

    if (!dto.isClosed) {
      throw new ForbiddenException('User can only set isClosed to true');
    }

    return this.todoService.updateUser(id, dto, userId);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ReturnTodoDto })
  async remove(
    @CorrId() corrId: number,
    @Param('id', ParseIntPipe) id: number,
    @IsAdmin() isAdmin: boolean,
    @UserId() userId: number,
  ) {
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can delete todos');
    }

    return this.todoService.remove(id, isAdmin, userId);
  }
}
