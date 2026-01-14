import { AuthService } from './auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { PasswordService } from '../user/password.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { UserEntity } from '../user/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, ReturnUserDto } from '../user/dto';

describe('AuthService', () => {
  let service: AuthService;

  const usersService = {
    findOneEntityByUsername: jest.fn(),
    create: jest.fn(),
  };

  const passwordService = {
    verifyPassword: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: usersService },
        { provide: PasswordService, useValue: passwordService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('signIn() should return access_token on valid credentials', async () => {
    const corrId = 123;
    const signInDto = { username: 'admin', password: 'admin' } as SignInDto;

    const user = {
      id: 1,
      username: 'admin',
      passwordHash: 'HASHED',
    } as UserEntity;

    usersService.findOneEntityByUsername.mockResolvedValue(user);
    passwordService.verifyPassword.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const result = await service.signIn(corrId, signInDto);

    expect(usersService.findOneEntityByUsername).toHaveBeenCalledWith(
      corrId,
      'admin',
    );
    expect(passwordService.verifyPassword).toHaveBeenCalledWith(
      'HASHED',
      'admin',
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 1,
      username: 'admin',
    });
    expect(result).toEqual({ access_token: 'jwt-token' });
  });

  it('signIn() should throw UnauthorizedException when password is invalid', async () => {
    const corrId = 123;
    const signInDto = { username: 'admin', password: 'wrong' } as SignInDto;

    const user = {
      id: 1,
      username: 'admin',
      passwordHash: 'HASHED',
    } as UserEntity;

    usersService.findOneEntityByUsername.mockResolvedValue(user);
    passwordService.verifyPassword.mockResolvedValue(false);

    await expect(service.signIn(corrId, signInDto)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('signIn() should bubble up if usersService throws (e.g., user not found)', async () => {
    const corrId = 123;
    const signInDto = { username: 'missing', password: 'x' } as SignInDto;

    usersService.findOneEntityByUsername.mockRejectedValue(
      new Error('User not found'),
    );

    await expect(service.signIn(corrId, signInDto)).rejects.toThrow(
      'User not found',
    );
    expect(passwordService.verifyPassword).not.toHaveBeenCalled();
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('register() should call usersService.create and return the created user', async () => {
    const corrId = 123;
    const dto: CreateUserDto = {
      username: 'newUser',
      password: 'strongPassword',
      email: 'user@example.com',
    };

    const newUser = {
      id: 2,
      username: 'newUser',
      email: 'user@example.com',
      isAdmin: false,
      createdAt: '2026-01-14T08:00:00.000Z',
      updatedAt: '2026-01-14T08:00:00.000Z',
    } as ReturnUserDto;

    usersService.create.mockResolvedValue(newUser);

    const result = await service.register(corrId, dto);

    expect(usersService.create).toHaveBeenCalledWith(corrId, dto);
    expect(result).toEqual(newUser);
  });

  it('register() should throw error if usersService.create fails', async () => {
    const corrId = 123;
    const dto: CreateUserDto = {
      username: 'newUser',
      password: 'strongPassword',
      email: 'user@example.com',
    };

    usersService.create.mockRejectedValue(new Error('User creation failed'));

    await expect(service.register(corrId, dto)).rejects.toThrow(
      'User creation failed',
    );
  });
});
