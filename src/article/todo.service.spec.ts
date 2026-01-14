import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoService } from './todo.service';
import { TodoEntity } from './entities/todo.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ReturnTodoDto } from './dto/return-todo.dto';

type RepoMock = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOneBy: jest.Mock;
  remove: jest.Mock;
};

describe('ArticleService', () => {
  let service: TodoService;
  let repo: RepoMock;

  const createArticleDto: CreateTodoDto = {
    articleName: 'Test',
    articleDescription: 'Desc',
    articlePrice: 10,
  };
  const updateArticleDto: UpdateTodoDto = {
    articleName: 'Test',
    articleDescription: 'Desc',
    articlePrice: 10,
  };
  const returnArticleDto: ReturnTodoDto = {
    id: 1,
    articleName: 'Test',
    articleDescription: 'Desc',
    articlePrice: 10,
  };

  const entity: TodoEntity = {
    id: 1,
    articleName: 'Test',
    articleDescription: 'Desc',
    articlePrice: 10,
  } as TodoEntity;

  beforeEach(async () => {
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

    service = module.get(TodoService);
  });

  describe('create', () => {
    it('create() should create an article', async () => {
      repo.create.mockReturnValue(createArticleDto);
      repo.save.mockResolvedValue(entity);

      const result = await service.create(createArticleDto);

      expect(repo.create).toHaveBeenCalledWith(createArticleDto);
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(returnArticleDto);
    });
  });

  describe('findAll', () => {
    it('findAll() should return an array', async () => {
      repo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('findOne() should throw NotFoundException if missing', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('findOne() should return a single entry', async () => {
      repo.findOneBy.mockResolvedValue(entity);
      await expect(service.findOne(1)).resolves.toEqual(returnArticleDto);
    });
  });

  describe('replace', () => {
    it('replace() should update an article', async () => {
      repo.findOneBy.mockResolvedValue(entity);
      repo.save.mockResolvedValue(entity);

      const result = await service.replace(1, returnArticleDto);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repo.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(returnArticleDto);
    });

    it('replace() with not found id should throw NotFoundException', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.replace(1, returnArticleDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('update() should update an article', async () => {
      repo.findOneBy.mockResolvedValue(entity);
      repo.save.mockResolvedValue(entity);

      const result = await service.update(1, updateArticleDto);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repo.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(returnArticleDto);
    });

    it('update() with not found id should throw NotFoundException', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.update(1, returnArticleDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('remove valid article', async () => {
      repo.findOneBy.mockResolvedValue(entity);
      repo.remove.mockResolvedValue(entity);
      await service.remove(1);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repo.remove).toHaveBeenCalledWith(entity);
    });
    it('remove with not found id should throw NotFoundException', async () => {
      repo.findOneBy.mockResolvedValue(null);
      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
