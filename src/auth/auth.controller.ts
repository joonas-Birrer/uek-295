import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CorrId, User, Public } from '../decorators';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from './auth.guard';
import { ReturnUserDto, CreateUserDto } from '../user/dto';
import { TokenInfoDto } from './dto/token-info.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TokenInfoDto })
  signIn(@CorrId() corrId: number, @Body() signInDto: SignInDto) {
    this.logger.log(
      `${corrId} login with: ${JSON.stringify({ username: signInDto.username })}`,
    );
    return this.authService.signIn(corrId, signInDto);
  }

  @Public()
  @Post('register')
  @ApiCreatedResponse({ type: ReturnUserDto })
  register(@CorrId() corrId: number, @Body() dto: CreateUserDto) {
    return this.authService.register(corrId, dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: ReturnUserDto })
  getProfile(@User() user: ReturnUserDto) {
    return user;
  }
}
