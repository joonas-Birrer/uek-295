import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TodoEntity } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { UpdateTodoAdminDto } from './dto/update-todo-admin.dto';
import { ReturnTodoDto } from './dto/return-todo.dto';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(TodoEntity)
    private readonly repo: Repository<TodoEntity>,
  ) {}

  private entityToDto(entity: TodoEntity): ReturnTodoDto {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description ?? '',
      isClosed: entity.isClosed,
      createdById: entity.createdById,
      updatedById: entity.updatedById,
      createdAt:
        entity.createdAt instanceof Date
          ? entity.createdAt.toISOString()
          : String(entity.createdAt),
      updatedAt:
        entity.updatedAt instanceof Date
          ? entity.updatedAt.toISOString()
          : String(entity.updatedAt),
    };
  }

  async create(
    createDto: CreateTodoDto,
    userId: number,
  ): Promise<ReturnTodoDto> {
    const now = new Date();

    const entity = this.repo.create({
      title: createDto.title,
      description: createDto.description,
      isClosed: false,
      createdAt: now,
      updatedAt: now,
      createdById: userId,
      updatedById: userId,
    });

    const saved = await this.repo.save(entity);
    return this.entityToDto(saved);
  }

  async findAll(userId: number, isAdmin: boolean): Promise<ReturnTodoDto[]> {
    if (isAdmin) {
      // Admin sees all Todos
      const arr = await this.repo.find();
      return arr.map((e) => this.entityToDto(e));
    }

    // Regular user sees only their own and open Todos
    const arr = await this.repo.find({
      where: {
        createdById: userId,
        isClosed: false,
      },
    });
    return arr.map((e) => this.entityToDto(e));
  }

  async findOne(
    id: number,
    userId: number,
    isAdmin: boolean,
  ): Promise<ReturnTodoDto> {
    const entity = await this.repo.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException(`Todo ${id} not found`);
    }

    if (!isAdmin && entity.createdById !== userId) {
      throw new ForbiddenException(
        'You are not authorized to access this Todo',
      );
    }

    // Users can only view their own open Todos
    if (!isAdmin && entity.isClosed === true) {
      throw new ForbiddenException('You can only view your open Todos');
    }

    return this.entityToDto(entity);
  }

  async updateUser(
    id: number,
    dto: UpdateTodoDto,
    userId: number,
  ): Promise<ReturnTodoDto> {
    const entity = await this.repo.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException(`Todo ${id} not found`);
    }

    if (entity.createdById !== userId) {
      throw new ForbiddenException('You can only update your own Todos');
    }

    // User can only close the Todo
    if (dto.isClosed !== true) {
      throw new ForbiddenException('User can only set isClosed to true');
    }

    const updated = await this.repo.save({
      ...entity,
      isClosed: dto.isClosed,
      updatedAt: new Date(),
      updatedById: userId,
      id,
    });

    return this.entityToDto(updated);
  }

  async updateAdmin(
    id: number,
    dto: UpdateTodoAdminDto,
    adminId: number,
  ): Promise<ReturnTodoDto> {
    const entity = await this.repo.findOneBy({ id });

    if (!entity) {
      throw new NotFoundException(`Todo ${id} not found`);
    }

    const updated = await this.repo.save({
      ...entity,
      isClosed: dto.isClosed,
      updatedAt: new Date(),
      updatedById: adminId,
      id,
    });

    return this.entityToDto(updated);
  }

  async remove(id: number, isAdmin: boolean): Promise<ReturnTodoDto> {
    const existing = await this.repo.findOneBy({ id });

    if (!existing) {
      throw new NotFoundException(`Todo ${id} not found`);
    }

    if (!isAdmin) {
      throw new ForbiddenException('Only admins can delete todos');
    }

    await this.repo.remove(existing);
    return this.entityToDto(existing);
  }
}
