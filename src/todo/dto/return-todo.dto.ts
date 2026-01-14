import { ApiProperty } from '@nestjs/swagger';

export class ReturnTodoDto {
  @ApiProperty({ description: 'id', example: 1 })
  id!: number;

  @ApiProperty({ description: 'title', example: 'Open admin' })
  title!: string;

  @ApiProperty({
    description: 'description',
    example: 'Example of an open admin todo',
  })
  description!: string;

  @ApiProperty({ description: 'isClosed', example: false })
  isClosed!: boolean;

  @ApiProperty({ description: 'createdById', example: 1 })
  createdById!: number;

  @ApiProperty({ description: 'updatedById', example: 1 })
  updatedById!: number;

  @ApiProperty({
    description: 'createdAt',
    example: '2026-01-14T08:00:00.000Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'updatedAt',
    example: '2026-01-14T08:00:00.000Z',
  })
  updatedAt!: string;
}
