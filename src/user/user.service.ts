import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto, ReturnUserDto, UpdateUserAdminDto } from './dto';
import { PasswordService } from './password.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
  ) {}

  async findOneEntityByUsername(corrId: number, username: string) {
    this.logger.verbose(
      `${corrId} ${this.findOneEntityByUsername.name} username: ${username}`,
    );
    const findEntity = await this.repo.findOneBy({ username });
    if (!findEntity) {
      this.logger.error(
        `${corrId} ${this.findOneEntityByUsername.name} not found`,
      );
      throw new NotFoundException(`User ${username} not found`);
    }
    this.logger.verbose(
      `${corrId} ${this.findOneEntityByUsername.name} found: ${JSON.stringify(findEntity, null, 2)}`,
    );
    return findEntity;
  }

  private entityToDto(corrId: number, entity: UserEntity): ReturnUserDto {
    this.logger.verbose(
      `${corrId} ${this.entityToDto.name} entity: ${JSON.stringify(entity, null, 2)}`,
    );
    const dto = {
      id: entity.id,
      username: entity.username,
      email: entity.email,
      isAdmin: entity.isAdmin,
    } as ReturnUserDto;
    this.logger.verbose(
      `${corrId} ${this.entityToDto.name} dto: ${JSON.stringify(dto, null, 2)}`,
    );
    return dto;
  }

  async create(corrId: number, createDto: CreateUserDto) {
    this.logger.debug(
      `${corrId} ${this.create.name} createDto: ${JSON.stringify(createDto, null, 2)}`,
    );
    const createEntity = this.repo.create(createDto);
    const existing = await this.repo.findOneBy({
      username: createDto.username,
    });
    if (existing) {
      this.logger.warn(
        `${corrId} ${this.create.name} username already exists: ${createDto.username}`,
      );
      throw new ConflictException(
        `Username ${createDto.username} already exists`,
      );
    }
    createEntity.passwordHash = await this.passwordService.hashPassword(
      createDto.password,
    );
    const savedEntity = await this.repo.save(createEntity);
    return this.entityToDto(corrId, savedEntity);
  }

  async findAll(corrId: number) {
    this.logger.verbose(`${corrId} ${this.findAll.name}`);
    const arr = await this.repo.find();
    return arr.map((e) => this.entityToDto(corrId, e));
  }

  async findOne(corrId: number, id: number) {
    this.logger.verbose(`${corrId} ${this.findOne.name} id: ${id}`);
    const findEntity = await this.repo.findOneBy({ id });
    if (!findEntity) {
      this.logger.error(`${corrId} ${this.findOne.name} id: ${id} not found`);
      throw new NotFoundException(`User ${id} not found`);
    }
    return this.entityToDto(corrId, findEntity);
  }

  async replace(
    corrId: number,
    id: number,
    returnDto: ReturnUserDto,
  ): Promise<ReturnUserDto> {
    this.logger.verbose(
      `${corrId} ${this.replace.name} id: ${id} returnDto: ${JSON.stringify(
        returnDto,
        null,
        2,
      )}`,
    );
    const existingEntity = await this.repo.findOneBy({ id });
    if (!existingEntity) {
      this.logger.error(`${corrId} ${this.replace.name} id: ${id} not found`);
      throw new NotFoundException(`User ${id} not found`);
    }
    const replacedEntity = await this.repo.save({
      ...existingEntity,
      ...returnDto,
      id,
    });
    return this.entityToDto(corrId, replacedEntity);
  }

  async update(
    corrId: number,
    id: number,
    updateUserAdminDto: UpdateUserAdminDto,
  ) {
    this.logger.verbose(
      `${corrId} ${this.update.name} id: ${id} updateUserAdminDto: ${JSON.stringify(
        updateUserAdminDto,
        null,
        2,
      )}`,
    );
    // only administrators can update users
    const existingEntity = await this.repo.findOneBy({ id });
    if (!existingEntity) {
      this.logger.error(`${corrId} ${this.update.name} id: ${id} not found`);
      throw new NotFoundException(`User ${id} not found`);
    }
    const updatedEntity = await this.repo.save({
      ...existingEntity,
      ...updateUserAdminDto,
      id,
    });
    return this.entityToDto(corrId, updatedEntity);
  }

  async remove(corrId: number, id: number) {
    this.logger.verbose(`${corrId} ${this.remove.name} id: ${id}`);
    // todo: only administrators can delete users
    const existing = await this.repo.findOneBy({ id });
    if (!existing) {
      this.logger.error(`${corrId} ${this.remove.name} id: ${id} not found`);
      throw new NotFoundException(`User ${id} not found`);
    }
    const deleted = await this.repo.remove(existing);
    this.logger.verbose(
      `${corrId} ${this.remove.name} id: ${id} deleted: ${JSON.stringify(deleted, null, 2)}`,
    );
    return this.entityToDto(corrId, existing);
  }
}
