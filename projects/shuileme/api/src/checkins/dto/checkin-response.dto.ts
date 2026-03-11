import { ApiProperty } from '@nestjs/swagger';
import { CheckinStatus } from '../checkin.entity';

export class CheckinResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'uuid-string' })
  userId: string;

  @ApiProperty({ example: '2024-01-01' })
  checkinDate: Date;

  @ApiProperty({ example: '22:30:00', required: false })
  checkinTime?: string;

  @ApiProperty({ enum: ['completed', 'missed', 'pending'] })
  status: CheckinStatus;

  @ApiProperty({ example: '今天状态不错', required: false })
  note?: string;

  @ApiProperty({ example: 8, required: false })
  sleepQuality?: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 'uuid-string', required: false })
  supervisedBy?: string;
}
