import { ApiProperty } from '@nestjs/swagger';
import {
  IsLowercase,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'user1234' })
  @IsString()
  @IsNotEmpty()
  @IsLowercase()
  @Length(8, 20)
  username!: string;

  @ApiProperty({ example: 'AbcD12$%' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  @Matches(/[a-z]/, { message: 'password needs min 1 lowercase' })
  @Matches(/[A-Z].*[A-Z]/, { message: 'password needs min 2 uppercase' })
  @Matches(/\d/, { message: 'password needs min 1 number' })
  @Matches(/[@$!%*?&]/, { message: 'password needs min 1 special @$!%*?&' })
  password!: string;
}
