import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateTodoAdminDto {
  @ApiProperty({ description: 'Set closed state (admin)', example: false })
  @IsBoolean()
  @IsNotEmpty()
  isClosed!: boolean;
}
