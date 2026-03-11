import { IsString, IsNotEmpty, MinLength, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '13800138000', description: '手机号' })
  @IsPhoneNumber('CN')
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'password123', description: '密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
