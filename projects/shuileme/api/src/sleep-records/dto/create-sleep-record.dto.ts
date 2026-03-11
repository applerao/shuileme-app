import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSleepRecordDto {
  @ApiProperty({ example: '2024-01-01T22:30:00.000Z', description: '入睡时间' })
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  bedtime: Date;

  @ApiProperty({ example: '2024-01-02T06:30:00.000Z', description: '起床时间' })
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  wakeTime: Date;

  @ApiPropertyOptional({ example: 480, description: '睡眠时长 (分钟)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sleepDuration?: number;

  @ApiPropertyOptional({ example: 120, description: '深睡时长 (分钟)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  deepSleepDuration?: number;

  @ApiPropertyOptional({ example: 300, description: '浅睡时长 (分钟)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  lightSleepDuration?: number;

  @ApiPropertyOptional({ example: 60, description: '清醒时长 (分钟)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  awakeDuration?: number;

  @ApiPropertyOptional({ example: 8, description: '睡眠质量 (1-10)', minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  sleepQuality?: number;

  @ApiPropertyOptional({ example: '昨晚睡得不错', description: '备注' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: '2024-01-02', description: '记录日期' })
  @IsOptional()
  @IsDateString()
  recordDate?: Date;
}
