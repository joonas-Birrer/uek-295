import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsLowercase, IsString, Matches } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'user1234' })
  @IsString()
  @IsNotEmpty()
  @IsLowercase()
  username: string;

  @ApiProperty({ example: 'user12A$' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
