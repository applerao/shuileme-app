import { ApiProperty } from '@nestjs/swagger';
import { SupervisionStatus } from '../supervision.entity';

export class SupervisionResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'uuid-string' })
  supervisorId: string;

  @ApiProperty({ example: 'uuid-string' })
  superviseeId: string;

  @ApiProperty({ enum: ['pending', 'active', 'rejected', 'cancelled'] })
  status: SupervisionStatus;

  @ApiProperty({ example: '一起坚持早睡！', required: false })
  message?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  approvedAt?: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', required: false })
  rejectedAt?: Date;
}
