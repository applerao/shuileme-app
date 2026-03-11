import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RemindDto {
  @ApiProperty({ example: 'uuid-string', description: '用户 ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: '该睡觉啦！', description: '提醒消息内容' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ example: 'remind', enum: ['remind', 'encourage', 'custom'], description: '消息类型' })
  @IsOptional()
  @IsString()
  type?: string;
}
