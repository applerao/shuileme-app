import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WechatLoginDto {
  @ApiProperty({ example: 'wechat_auth_code_xxxxx', description: '微信授权码' })
  @IsString()
  @IsNotEmpty()
  wechatCode: string;
}
