import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoService } from './todo.service';
import { TodoEntity } from './entities/todo.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ReturnTodoDto } from './dto/return-todo.dto';
import { UpdateTodoAdminDto } from './dto/update-todo-admin.dto';

type RepoMock = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOneBy: jest.Mock;
  remove: jest.Mock;
};

describe('TodoService', () => {
  let service: TodoService;
  let repo: RepoMock;

  const createTodoDto: CreateTodoDto = {
    title: 'Test Todo',
    description: 'Test Description',
  };
  const updateTodoDto: UpdateTodoDto = {
    isClosed: true,
  };
  const updateTodoAdminDto: UpdateTodoAdminDto = {
    isClosed: true,
  };
  const returnTodoDto: ReturnTodoDto = {
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    isClosed: false,
    createdById: 1,
    updatedById: 1,
    createdAt: '2026-01-14T09:57:27.006Z',
    updatedAt: '2026-01-14T09:57:27.006Z',
  };

  const entity: TodoEntity = {
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    isClosed: false,
    createdById: 1,
    updatedById: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as TodoEntity;

  beforeEach(async () => {
    // Mocking current date to ensure consistency across tests
    const fixedDate = new Date('2026-01-14T09:57:27.006Z');
    jest.spyOn(global, 'Date').mockImplementation(() => fixedDate as string);

    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(TodoEntity),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
  });

  describe('create', () => {
    it('should create a Todo', async () => {
      repo.create.mockReturnValue(entity);
      repo.save.mockResolvedValue(entity);

      const result = await service.create(createTodoDto, 1);

      expect(repo.create).toHaveBeenCalledWith(createTodoDto);
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual({
        ...returnTodoDto,
        createdAt: '2026-01-14T09:57:27.006Z',
        updatedAt: '2026-01-14T09:57:27.006Z',
      });
    });
  });

  describe('findAll', () => {
    it('should return all Todos for admin', async () => {
      repo.find.mockResolvedValue([entity]);
      const result = await service.findAll(1, true);

      expect(result).toEqual([returnTodoDto]);
    });

    it('should return only open Todos for the user', async () => {
      repo.find.mockResolvedValue([entity]);
      const result = await service.findAll(1, false);

      expect(result).toEqual([returnTodoDto]);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if Todo not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(999, 1, false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return a single Todo', async () => {
      repo.findOneBy.mockResolvedValue(entity);
      const result = await service.findOne(1, 1, false);

      expect(result).toEqual(returnTodoDto);
    });

    it('should throw ForbiddenException for closed Todo if not admin', async () => {
      repo.findOneBy.mockResolvedValue({ ...entity, isClosed: true });
      await expect(service.findOne(1, 1, false)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update a Todo for the user', async () => {
      repo.findOneBy.mockResolvedValue(entity);
      repo.save.mockResolvedValue(entity);

      const result = await service.updateUser(1, updateTodoDto, 1);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repo.save).toHaveBeenCalledWith({
        ...entity,
        isClosed: true,
        updatedAt: expect.any(Date),
        updatedById: 1,
      });
      expect(result).toEqual(returnTodoDto);
    });

    it('should throw NotFoundException if Todo not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.updateUser(1, updateTodoDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if user tries to update another user's Todo", async () => {
      repo.findOneBy.mockResolvedValue({ ...entity, createdById: 2 });
      await expect(service.updateUser(1, updateTodoDto, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('updateAdmin', () => {
    it('should update Todo as an admin', async () => {
      repo.findOneBy.mockResolvedValue(entity);
      repo.save.mockResolvedValue(entity);

      const result = await service.updateAdmin(1, updateTodoAdminDto, 1);

      expect(result).toEqual(returnTodoDto);
    });

    it('should throw NotFoundException if Todo not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(
        service.updateAdmin(1, updateTodoAdminDto, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove Todo if admin', async () => {
      repo.findOneBy.mockResolvedValue(entity);
      repo.remove.mockResolvedValue(entity);

      const result = await service.remove(1, true);

      expect(result).toEqual(returnTodoDto);
    });

    it('should throw NotFoundException if Todo not found', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.remove(999, true)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if not admin', async () => {
      repo.findOneBy.mockResolvedValue(entity);
      await expect(service.remove(1, false)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
