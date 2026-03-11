import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  token: string;

  @ApiProperty({ description: '用户信息' })
  userInfo: {
    id: string;
    phone: string;
    nickname?: string;
    avatar?: string;
    wechatId?: string;
    createdAt: Date;
  };
}

export class SendCodeResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}
