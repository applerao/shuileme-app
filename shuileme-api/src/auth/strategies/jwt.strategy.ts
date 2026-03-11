import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

export interface JwtPayload {
  sub: string;
  phone: string;
  wechatId?: string;
  iat?: number;
  exp?: number;
}

export interface JwtUser {
  userId: string;
  phone: string;
  wechatId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-change-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new UnauthorizedException('用户未找到或账户已禁用');
    }
    return {
      userId: user.id,
      phone: user.phone,
      wechatId: user.wechatId,
    };
  }
}
