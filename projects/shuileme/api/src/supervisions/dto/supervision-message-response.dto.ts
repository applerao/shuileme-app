import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../supervision-message.entity';

export class SupervisionMessageResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'uuid-string' })
  supervisionId: string;

  @ApiProperty({ example: 'uuid-string' })
  senderId: string;

  @ApiProperty({ example: 'uuid-string' })
  receiverId: string;

  @ApiProperty({ enum: ['remind', 'encourage', 'custom'] })
  type: MessageType;

  @ApiProperty({ example: '该睡觉啦！' })
  message: string;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}
