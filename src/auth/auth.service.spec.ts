import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PasswordService } from '../../../uek-lb/src/user/password.service';
import { SignInDto } from './dto/sign-in.dto';
import { UserEntity } from '../user/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;

  // simple jest-mocks
  const usersService = {
    findOneEntityByUsername: jest.fn(),
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

  it('signIn() should bubble up if usersService throws (e.g. user not found)', async () => {
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
});
