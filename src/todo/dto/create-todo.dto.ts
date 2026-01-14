import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateTodoDto {
  @ApiProperty({ description: 'Todo title', example: 'Open admin' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 50)
  title!: string;

  @ApiProperty({
    description: 'Todo description',
    example: 'Example of an open admin todo',
  })
  description!: string;
}
