import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { AuthResponseDto, SendCodeResponseDto } from './dto/auth-response.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  @SkipThrottle({ short: true })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送验证码', description: '发送短信验证码到手机号，有效期 5 分钟' })
  @ApiResponse({ status: 200, type: SendCodeResponseDto })
  @ApiResponse({ status: 400, description: '无效的手机号或发送过于频繁' })
  async sendCode(@Body() sendCodeDto: SendCodeDto): Promise<SendCodeResponseDto> {
    await this.authService.sendCode(sendCodeDto.phone);
    return { success: true };
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '用户注册', description: '使用手机号、密码和验证码注册新用户' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  @ApiResponse({ status: 400, description: '验证码无效或已过期 | 手机号已注册' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录', description: '使用手机号和密码登录' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: '手机号或密码错误 | 账户已被禁用' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto.phone, loginDto.password);
  }

  @Post('wechat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '微信登录', description: '使用微信授权码登录，自动创建或关联账户' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 400, description: '微信授权码无效' })
  @ApiResponse({ status: 401, description: '账户已被禁用' })
  async wechatLogin(@Body() wechatLoginDto: WechatLoginDto): Promise<AuthResponseDto> {
    return this.authService.wechatLogin(wechatLoginDto.wechatCode);
  }
}
