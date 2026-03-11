import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSupervisionDto {
  @ApiProperty({ example: 'uuid-string', description: '用户 ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'uuid-string', description: '监督者 ID' })
  @IsString()
  @IsNotEmpty()
  supervisorId: string;
}
