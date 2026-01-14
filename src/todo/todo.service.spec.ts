import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TodoService } from './todo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoEntity } from './entities/todo.entity';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { UpdateTodoAdminDto } from './dto/update-todo-admin.dto';

describe('TodoService', () => {
  let service: TodoService;
  let repo: Repository<TodoEntity>;
  const date = new Date();

  const mockTodoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(TodoEntity),
          useValue: mockTodoRepository,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    repo = module.get<Repository<TodoEntity>>(getRepositoryToken(TodoEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() should create a new todo and return it', async () => {
    const createTodoDto: CreateTodoDto = {
      title: 'Test Todo',
      description: 'Test Description',
    };
    const userId = 1;

    const newTodo = {
      id: 1,
      ...createTodoDto,
      isClosed: false,
      createdAt: date,
      updatedAt: date,
      createdById: userId,
      updatedById: userId,
    } as TodoEntity;

    mockTodoRepository.create.mockReturnValue(newTodo);
    mockTodoRepository.save.mockResolvedValue(newTodo);

    const result = await service.create(createTodoDto, userId);
    expect(mockTodoRepository.save).toHaveBeenCalledWith(newTodo);
    expect(result).toEqual({
      id: 1,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: userId,
      updatedById: userId,
      createdAt: date.toString(),
      updatedAt: date.toString(),
    });
  });

  it('findAll() should return todos for a user', async () => {
    const userId = 1;
    const isAdmin = false;

    const todos = [
      {
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        isClosed: false,
        createdById: userId,
        updatedById: userId,
        createdAt: date,
        updatedAt: date,
      } as TodoEntity,
    ];

    mockTodoRepository.find.mockResolvedValue(todos);

    const result = await service.findAll(userId, isAdmin);

    expect(mockTodoRepository.find).toHaveBeenCalledWith({
      where: {
        createdById: userId,
        isClosed: false,
      },
    });
    expect(result).toEqual([
      {
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        isClosed: false,
        createdById: userId,
        updatedById: userId,
        createdAt: date.toString(),
        updatedAt: date.toString(),
      },
    ]);
  });

  it('findOne() should return a todo if it exists', async () => {
    const userId = 1;
    const isAdmin = false;
    const todoId = 1;

    const todo = {
      id: todoId,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: userId,
      updatedById: userId,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    mockTodoRepository.findOneBy.mockResolvedValue(todo);

    const result = await service.findOne(todoId, userId, isAdmin);

    expect(mockTodoRepository.findOneBy).toHaveBeenCalledWith({ id: todoId });
    expect(result).toEqual({
      id: todoId,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: userId,
      updatedById: userId,
      createdAt: date.toString(),
      updatedAt: date.toString(),
    });
  });

  it('findOne() should throw NotFoundException if todo is not found', async () => {
    const userId = 1;
    const isAdmin = false;
    const todoId = 999;

    mockTodoRepository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(todoId, userId, isAdmin)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('updateUser() should update a todo for a user', async () => {
    const userId = 1;
    const todoId = 1;
    const updateDto: UpdateTodoDto = { isClosed: true };

    const todo = {
      id: todoId,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: userId,
      updatedById: userId,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    const updatedTodo = { ...todo, ...updateDto, updatedAt: date };

    mockTodoRepository.findOneBy.mockResolvedValue(todo);
    mockTodoRepository.save.mockResolvedValue(updatedTodo);

    const result = await service.updateUser(todoId, updateDto, userId);

    expect(mockTodoRepository.findOneBy).toHaveBeenCalledWith({ id: todoId });
    expect(result).toEqual({
      id: todoId,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: true,
      createdById: userId,
      updatedById: userId,
      createdAt: date.toString(),
      updatedAt: date.toString(),
    });
  });

  it('remove() should delete a todo for an admin', async () => {
    const adminId = 1;
    const todoId = 1;

    const todo = {
      id: todoId,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: adminId,
      updatedById: adminId,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    mockTodoRepository.findOneBy.mockResolvedValue(todo);
    mockTodoRepository.remove.mockResolvedValue(todo);

    const result = await service.remove(todoId, true, adminId);

    expect(mockTodoRepository.findOneBy).toHaveBeenCalledWith({ id: todoId });
    expect(mockTodoRepository.remove).toHaveBeenCalledWith(todo);
    expect(result).toEqual({
      id: todoId,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: adminId,
      updatedById: adminId,
      createdAt: date.toString(),
      updatedAt: date.toString(),
    });
  });

  it('remove() should throw ForbiddenException if user is not an admin', async () => {
    const userId = 1;
    const todoId = 1;

    const todo = {
      id: todoId,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: userId,
      updatedById: userId,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    mockTodoRepository.findOneBy.mockResolvedValue(todo);

    await expect(service.remove(todoId, false, userId)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('findAll() should return all todos when admin user is true', async () => {
    const adminId = 1;
    const isAdmin = true;

    const todos = [
      {
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        isClosed: false,
        createdById: adminId,
        updatedById: adminId,
        createdAt: date,
        updatedAt: date,
      },
      {
        id: 2,
        title: 'Closed Todo',
        description: 'Closed Description',
        isClosed: true,
        createdById: adminId,
        updatedById: adminId,
        createdAt: date,
        updatedAt: date,
      },
    ];

    mockTodoRepository.find.mockResolvedValue(todos);

    const result = await service.findAll(adminId, isAdmin);

    expect(mockTodoRepository.find).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        isClosed: false,
        createdById: adminId,
        updatedById: adminId,
        createdAt: date.toString(),
        updatedAt: date.toString(),
      },
      {
        id: 2,
        title: 'Closed Todo',
        description: 'Closed Description',
        isClosed: true,
        createdById: adminId,
        updatedById: adminId,
        createdAt: date.toString(),
        updatedAt: date.toString(),
      },
    ]);
  });

  it("updateUser() should throw ForbiddenException if user tries to update another user's todo", async () => {
    const userId = 1;
    const todoId = 2;
    const updateDto: UpdateTodoDto = { isClosed: false };

    const todo = {
      id: todoId,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: 2,
      updatedById: 2,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    mockTodoRepository.findOneBy.mockResolvedValue(todo);

    await expect(service.updateUser(todoId, updateDto, userId)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('remove() should throw NotFoundException if todo does not exist', async () => {
    const adminId = 1;
    const todoId = 999;

    mockTodoRepository.findOneBy.mockResolvedValue(null);

    await expect(service.remove(todoId, true, adminId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findAll() should return all todos when admin user is true', async () => {
    const adminId = 1;
    const isAdmin = true;

    const todos = [
      {
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        isClosed: false,
        createdById: adminId,
        updatedById: adminId,
        createdAt: date,
        updatedAt: date,
      },
      {
        id: 2,
        title: 'Closed Todo',
        description: 'Closed Description',
        isClosed: true,
        createdById: adminId,
        updatedById: adminId,
        createdAt: date,
        updatedAt: date,
      },
    ];

    mockTodoRepository.find.mockResolvedValue(todos);

    const result = await service.findAll(adminId, isAdmin);

    expect(mockTodoRepository.find).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        isClosed: false,
        createdById: adminId,
        updatedById: adminId,
        createdAt: date.toString(),
        updatedAt: date.toString(),
      },
      {
        id: 2,
        title: 'Closed Todo',
        description: 'Closed Description',
        isClosed: true,
        createdById: adminId,
        updatedById: adminId,
        createdAt: date.toString(),
        updatedAt: date.toString(),
      },
    ]);
  });

  it("updateUser() should throw ForbiddenException if user tries to update another user's todo", async () => {
    const userId = 1;
    const todoId = 2;
    const updateDto: UpdateTodoDto = { isClosed: true };

    const todo = {
      id: todoId,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: 2,
      updatedById: 2,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    mockTodoRepository.findOneBy.mockResolvedValue(todo);

    await expect(service.updateUser(todoId, updateDto, userId)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("updateUser() should throw ForbiddenException if user tries to update another user's todo", async () => {
    const userId = 2;
    const todoId = 1;
    const updateDto: UpdateTodoDto = { isClosed: true };

    const todo = {
      id: todoId,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: 1,
      updatedById: 1,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    mockTodoRepository.findOneBy.mockResolvedValue(todo);

    await expect(service.updateUser(todoId, updateDto, userId)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('remove() should throw NotFoundException if todo does not exist', async () => {
    const adminId = 1;
    const todoId = 999;

    mockTodoRepository.findOneBy.mockResolvedValue(null);

    await expect(service.remove(todoId, true, adminId)).rejects.toThrow(
      NotFoundException,
    );
  });
  it('should throw NotFoundException if todo is not found', async () => {
    const id = 1;
    const userId = 1;
    const isAdmin = false;

    mockTodoRepository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(id, userId, isAdmin)).rejects.toThrow(
      new NotFoundException(`Todo ${id} not found`),
    );
  });

  it('should throw ForbiddenException if user tries to access a todo not created by them', async () => {
    const id = 1;
    const userId = 2;
    const isAdmin = false;

    const todo = {
      id: 1,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: 1,
      updatedById: 1,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    mockTodoRepository.findOneBy.mockResolvedValue(todo);

    await expect(service.findOne(id, userId, isAdmin)).rejects.toThrow(
      new ForbiddenException('You are not authorized to access this Todo'),
    );
  });

  it('should return the todo if the user created it and the todo is open', async () => {
    const id = 1;
    const userId = 1;
    const isAdmin = false;

    const todo = {
      id: 1,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: userId,
      updatedById: userId,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    mockTodoRepository.findOneBy.mockResolvedValue(todo);

    const result = await service.findOne(id, userId, isAdmin);

    expect(result).toEqual({
      id: 1,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: userId,
      updatedById: userId,
      createdAt: date.toString(),
      updatedAt: date.toString(),
    });
  });

  it('should return the todo if the user is an admin, regardless of the closed status', async () => {
    const id = 1;
    const userId = 1;
    const isAdmin = true;

    const todo = {
      id: 1,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: true,
      createdById: 2,
      updatedById: 2,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    mockTodoRepository.findOneBy.mockResolvedValue(todo);

    const result = await service.findOne(id, userId, isAdmin);

    expect(result).toEqual({
      id: 1,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: true,
      createdById: 2,
      updatedById: 2,
      createdAt: date.toString(),
      updatedAt: date.toString(),
    });
  });

  it('should throw NotFoundException if todo is not found', async () => {
    const id = 1;
    const userId = 1;
    const dto: UpdateTodoDto = { isClosed: true };

    mockTodoRepository.findOneBy.mockResolvedValue(null);

    await expect(service.updateUser(id, dto, userId)).rejects.toThrow(
      new NotFoundException(`Todo ${id} not found`),
    );
  });

  it("should throw ForbiddenException if user tries to update someone else's todo", async () => {
    const id = 1;
    const userId = 2;
    const dto: UpdateTodoDto = { isClosed: true };

    const todo = {
      id: 1,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: 1,
      updatedById: 1,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    mockTodoRepository.findOneBy.mockResolvedValue(todo);

    await expect(service.updateUser(id, dto, userId)).rejects.toThrow(
      new ForbiddenException('You can only update your own Todos'),
    );
  });

  it('should throw ForbiddenException if user tries to update their todo with isClosed set to false', async () => {
    const id = 1;
    const userId = 1;
    const dto: UpdateTodoDto = { isClosed: false };

    const todo = {
      id: 1,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: userId,
      updatedById: userId,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    mockTodoRepository.findOneBy.mockResolvedValue(todo);

    await expect(service.updateUser(id, dto, userId)).rejects.toThrow(
      new ForbiddenException('User can only set isClosed to true'),
    );
  });

  it('should update todo if user owns it and sets isClosed to true', async () => {
    const id = 1;
    const userId = 1;
    const dto: UpdateTodoDto = { isClosed: true };

    const todo = {
      id: 1,
      title: 'Test Todo',
      description: 'Test Description',
      isClosed: false,
      createdById: userId,
      updatedById: userId,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    const updatedTodo = {
      ...todo,
      ...dto,
      updatedAt: date.toString(),
      createdAt: date.toString(),
    };

    mockTodoRepository.findOneBy.mockResolvedValue(todo);
    mockTodoRepository.save.mockResolvedValue(updatedTodo);

    const result = await service.updateUser(id, dto, userId);

    expect(mockTodoRepository.findOneBy).toHaveBeenCalledWith({ id });

    expect(result).toEqual(updatedTodo);
  });

  it('should throw NotFoundException if todo is not found', async () => {
    const id = 1;
    const adminId = 1;
    const dto: UpdateTodoAdminDto = { isClosed: true };

    mockTodoRepository.findOneBy.mockResolvedValue(null);

    await expect(service.updateAdmin(id, dto, adminId)).rejects.toThrow(
      new NotFoundException(`Todo ${id} not found`),
    );
  });

  it('should update todo when admin sets isClosed to false', async () => {
    const id = 1;
    const adminId = 1;
    const dto: UpdateTodoAdminDto = { isClosed: false };

    const todo = {
      id: 1,
      title: 'Test Todo',
      description: undefined,
      isClosed: true,
      createdById: 2,
      updatedById: 2,
      createdAt: date,
      updatedAt: date,
    } as unknown as TodoEntity;

    const updatedTodo = {
      ...todo,
      ...dto,
      description: '',
      updatedAt: date.toString(),
      createdAt: date.toString(),
    };

    mockTodoRepository.findOneBy.mockResolvedValue(todo);
    mockTodoRepository.save.mockResolvedValue(updatedTodo);

    const result = await service.updateAdmin(id, dto, adminId);

    expect(mockTodoRepository.findOneBy).toHaveBeenCalledWith({ id });
    expect(result).toEqual(updatedTodo);
  });
  it('findOne() throws ForbiddenException when non-admin accesses closed todo', async () => {
    const todo = {
      id: 1,
      title: 'Test',
      description: 'Desc',
      isClosed: true,
      createdById: 1,
      updatedById: 1,
      createdAt: date,
      updatedAt: date,
    } as TodoEntity;

    mockTodoRepository.findOneBy.mockResolvedValue(todo);

    await expect(service.findOne(1, 1, false)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
