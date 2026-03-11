import { IsOptional, IsString, IsInt, Min, Max, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCheckinDto {
  @ApiPropertyOptional({ example: '2024-01-01', description: '打卡日期' })
  @IsOptional()
  @IsDateString()
  checkinDate?: Date;

  @ApiPropertyOptional({ example: '今天状态不错', description: '备注' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 8, description: '睡眠质量 (1-10)', minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  sleepQuality?: number;
}
