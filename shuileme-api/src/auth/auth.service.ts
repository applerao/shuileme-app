import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { VerificationCodesService } from '../verification-codes/verification-codes.service';
import { VerificationCodeType } from '../verification-codes/verification-code.entity';
import { WechatService } from '../wechat/wechat.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private verificationCodesService: VerificationCodesService,
    private wechatService: WechatService,
  ) {}

  /**
   * 发送验证码到手机号
   */
  async sendCode(phone: string): Promise<void> {
    await this.verificationCodesService.createAndSend(
      phone,
      VerificationCodeType.REGISTER,
    );
  }

  /**
   * 用户注册 - 使用手机号、密码和验证码
   */
  async register(registerDto: RegisterDto): Promise<{ token: string; userInfo: any }> {
    const { phone, password, code, nickname } = registerDto;

    // 验证验证码
    const isValid = await this.verificationCodesService.verify(
      phone,
      code,
      VerificationCodeType.REGISTER,
    );

    if (!isValid) {
      throw new BadRequestException('验证码无效或已过期，请重新获取');
    }

    // 检查用户是否已存在
    const existingUser = await this.usersService.findByPhone(phone);
    if (existingUser) {
      throw new BadRequestException('该手机号已注册，请直接登录');
    }

    // 创建用户
    const user = await this.usersService.create({
      phone,
      password,
      nickname: nickname || `睡友${phone.slice(-4)}`,
    });

    return this.generateToken(user);
  }

  /**
   * 用户登录 - 使用手机号和密码
   */
  async login(phone: string, password: string): Promise<{ token: string; userInfo: any }> {
    const user = await this.usersService.findByPhone(phone);

    if (!user || !user.password) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('账户已被禁用，请联系客服');
    }

    return this.generateToken(user);
  }

  /**
   * 微信登录 - 使用微信授权码
   */
  async wechatLogin(wechatCode: string): Promise<{ token: string; userInfo: any }> {
    // 验证微信授权码并获取用户信息
    const wechatUserInfo = await this.wechatService.verifyAndUserInfo(wechatCode);
    const wechatId = wechatUserInfo.openid;

    // 查找已存在的用户
    let user = await this.usersService.findByWechatId(wechatId);

    if (!user) {
      // 创建新用户
      user = await this.usersService.create({
        phone: `wechat_${wechatId}`, // 微信用户占位手机号
        wechatId,
        nickname: wechatUserInfo.nickname || `微信用户${wechatId.slice(-4)}`,
        avatar: wechatUserInfo.headimgurl || undefined,
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('账户已被禁用，请联系客服');
    }

    return this.generateToken(user);
  }

  /**
   * 生成 JWT token
   */
  private generateToken(user: User): { token: string; userInfo: any } {
    const payload = {
      sub: user.id,
      phone: user.phone,
      wechatId: user.wechatId,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '7d'),
    });

    return {
      token,
      userInfo: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        wechatId: user.wechatId,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * JWT Strategy 验证用户
   */
  async validateUser(payload: { sub: string }): Promise<User | null> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }
}
