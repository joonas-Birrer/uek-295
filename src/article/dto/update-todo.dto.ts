import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateTodoDto {
  @ApiProperty({
    description: 'Close todo (user can only close)',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isClosed!: boolean;
}
