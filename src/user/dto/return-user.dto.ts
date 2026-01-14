import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ReturnUserDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id!: number;

  @ApiProperty({ example: 'user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  @IsLowercase()
  username!: string;

  @ApiProperty({ example: 'user@local.ch' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'false' })
  @IsBoolean()
  @IsNotEmpty()
  isAdmin!: boolean;
  @IsNotEmpty()
  createdAt: string;
  @IsNotEmpty()
  updatedAt: string;
  @IsNotEmpty()
  version: number;
  @IsNotEmpty()
  createdById: number;
  @IsNotEmpty()
  updatedById: number;
}
