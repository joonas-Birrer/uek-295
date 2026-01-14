import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PasswordService } from '../user/password.service';
import { SignInDto } from './dto/sign-in.dto';
import { TokenInfoDto } from './dto/token-info.dto';
import { CreateUserDto, ReturnUserDto } from '../user/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(corrId: number, signInDto: SignInDto): Promise<TokenInfoDto> {
    const user = await this.usersService.findOneEntityByUsername(
      corrId,
      signInDto.username,
    );
    if (
      !(await this.passwordService.verifyPassword(
        user.passwordHash,
        signInDto.password,
      ))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(corrId: number, dto: CreateUserDto): Promise<ReturnUserDto> {
    return this.usersService.create(corrId, dto);
  }
}
