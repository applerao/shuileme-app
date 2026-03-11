import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe', description: '用户名' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'john@example.com', description: '邮箱' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '13800138000', description: '手机号', required: false })
  @IsOptional()
  @IsPhoneNumber('CN')
  phone?: string;

  @ApiProperty({ example: 'John', description: '昵称', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ example: 'password123', description: '密码', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
