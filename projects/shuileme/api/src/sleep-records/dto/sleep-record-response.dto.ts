import { ApiProperty } from '@nestjs/swagger';

export class SleepRecordResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'uuid-string' })
  userId: string;

  @ApiProperty({ example: '2024-01-01T22:30:00.000Z' })
  bedtime: Date;

  @ApiProperty({ example: '2024-01-02T06:30:00.000Z' })
  wakeTime: Date;

  @ApiProperty({ example: 480 })
  sleepDuration: number;

  @ApiProperty({ example: 120, required: false })
  deepSleepDuration?: number;

  @ApiProperty({ example: 300, required: false })
  lightSleepDuration?: number;

  @ApiProperty({ example: 60, required: false })
  awakeDuration?: number;

  @ApiProperty({ example: 8 })
  sleepQuality: number;

  @ApiProperty({ example: '昨晚睡得不错', required: false })
  note?: string;

  @ApiProperty({ example: '2024-01-02' })
  recordDate: Date;

  @ApiProperty({ example: '2024-01-02T06:35:00.000Z' })
  createdAt: Date;
}
