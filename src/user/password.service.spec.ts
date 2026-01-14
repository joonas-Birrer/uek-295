import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { PasswordService } from '../../../uek-lb/src/user/password.service';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
  argon2id: 2,
}));

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ----------------------------------------------------------------
  // hashPassword
  // ----------------------------------------------------------------
  it('hashPassword() should call argon2.hash with correct options', async () => {
    (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');

    const result = await service.hashPassword('plain');

    expect(argon2.hash).toHaveBeenCalledWith('plain', {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    expect(result).toBe('hashed-password');
  });

  // ----------------------------------------------------------------
  // verifyPassword – success
  // ----------------------------------------------------------------
  it('verifyPassword() should return true when argon2.verify succeeds', async () => {
    (argon2.verify as jest.Mock).mockResolvedValue(true);

    const result = await service.verifyPassword('hash', 'password');

    expect(argon2.verify).toHaveBeenCalledWith('hash', 'password');
    expect(result).toBe(true);
  });

  // ----------------------------------------------------------------
  // verifyPassword – false
  // ----------------------------------------------------------------
  it('verifyPassword() should return false when argon2.verify returns false', async () => {
    (argon2.verify as jest.Mock).mockResolvedValue(false);

    const result = await service.verifyPassword('hash', 'wrong');

    expect(argon2.verify).toHaveBeenCalledWith('hash', 'wrong');
    expect(result).toBe(false);
  });

  // ----------------------------------------------------------------
  // verifyPassword – exception (catch path)
  // ----------------------------------------------------------------
  it('verifyPassword() should return false when argon2.verify throws', async () => {
    (argon2.verify as jest.Mock).mockRejectedValue(new Error('invalid hash'));

    const result = await service.verifyPassword('broken-hash', 'password');

    expect(argon2.verify).toHaveBeenCalledWith('broken-hash', 'password');
    expect(result).toBe(false);
  });
});
