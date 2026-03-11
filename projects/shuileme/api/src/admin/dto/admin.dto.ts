import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码', example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class CreateAdminDto {
  @ApiProperty({ description: '用户名', example: 'newadmin' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiProperty({ description: '姓名', example: '张三' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '角色', example: 'admin', required: false })
  @IsString()
  @IsOptional()
  role?: string;
}

export class UpdateAdminDto {
  @ApiProperty({ description: '姓名', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: '角色', required: false })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({ description: '是否激活', required: false })
  @IsOptional()
  isActive?: boolean;
}
