import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupervisionDto {
  @ApiProperty({ example: 'uuid-string', description: '被监督人 ID' })
  @IsString()
  @IsNotEmpty()
  superviseeId: string;

  @ApiPropertyOptional({ example: '一起坚持早睡！', description: '申请消息' })
  @IsOptional()
  @IsString()
  message?: string;
}
