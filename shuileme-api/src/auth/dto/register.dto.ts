import { IsString, IsNotEmpty, MinLength, MaxLength, IsPhoneNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: '13800138000', description: '手机号' })
  @IsPhoneNumber('CN')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'password123', description: '密码', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '123456', description: '短信验证码', minLength: 6, maxLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @ApiProperty({ example: '睡友 123', description: '昵称', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;
}
