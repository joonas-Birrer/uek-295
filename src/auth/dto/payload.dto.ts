import { ApiProperty } from '@nestjs/swagger';

export class PayloadDto {
  @ApiProperty({ example: 2 })
  sub!: number;

  @ApiProperty({ example: 'user1234' })
  username!: string;
}
