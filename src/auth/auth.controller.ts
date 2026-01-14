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
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
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

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: TokenInfoDto })
  @ApiBadRequestResponse({ description: 'Invalid login credentials' })
  signIn(@CorrId() corrId: number, @Body() signInDto: SignInDto) {
    this.logger.log(`Login attempt for: ${signInDto.username}`);
    return this.authService.signIn(corrId, signInDto);
  }

  @Public()
  @Post('register')
  @ApiCreatedResponse({ type: ReturnUserDto })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiConflictResponse({ description: 'User already exists' })
  register(@CorrId() corrId: number, @Body() dto: CreateUserDto) {
    return this.authService.register(corrId, dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: ReturnUserDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getProfile(@User() user: ReturnUserDto) {
    return user;
  }
}
